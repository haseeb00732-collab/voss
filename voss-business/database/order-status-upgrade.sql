-- Keep existing statuses and add Refused. Return after collection retains refund liability.
ALTER TABLE public.voss_orders DROP CONSTRAINT IF EXISTS voss_orders_status_check;
ALTER TABLE public.voss_orders ADD CONSTRAINT voss_orders_status_check CHECK(status IN ('received','confirmed','packed','shipped','delivered','cancelled','returned','refused'));
CREATE OR REPLACE FUNCTION voss_private.business_update(
  p_order_id uuid, p_version integer, p_action text, p_value text, p_note text, p_courier text, p_tracking text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE current_order public.voss_orders%ROWTYPE; previous_value text;
BEGIN
  PERFORM voss_private.require_owner();
  IF p_action IS NULL OR p_action NOT IN ('status','note','payment','courier') OR p_note IS NULL OR length(p_note)>2000
     OR p_value IS NULL OR p_courier IS NULL OR p_tracking IS NULL OR length(p_courier)>100 OR length(p_tracking)>150
  THEN RAISE EXCEPTION 'Invalid order update' USING ERRCODE='22023'; END IF;
  SELECT * INTO current_order FROM public.voss_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found' USING ERRCODE='P0002'; END IF;
  IF p_version IS DISTINCT FROM current_order.version THEN RAISE EXCEPTION 'Order changed. Refresh before saving.' USING ERRCODE='40001'; END IF;
  IF p_action='status' THEN
    IF NOT ((current_order.status='received' AND p_value IN ('confirmed','cancelled')) OR
      (current_order.status='confirmed' AND p_value IN ('packed','cancelled')) OR
      (current_order.status='packed' AND p_value IN ('shipped','cancelled')) OR
      (current_order.status='shipped' AND p_value IN ('delivered','returned','refused')) OR
      (current_order.status='delivered' AND p_value='returned'))
    THEN RAISE EXCEPTION 'That status change is not available.' USING ERRCODE='22023'; END IF;
    IF p_value IN ('cancelled','returned','refused') AND length(trim(p_note))<3 THEN RAISE EXCEPTION 'Add a reason for this change.' USING ERRCODE='22023'; END IF;
    previous_value := current_order.status;
    UPDATE public.voss_orders SET status=p_value WHERE id=p_order_id;
    INSERT INTO public.voss_order_history(order_id,old_status,new_status) VALUES(p_order_id,previous_value,p_value);
  ELSIF p_action='payment' THEN
    IF current_order.status<>'delivered' OR current_order.payment_status<>'pending' OR p_value<>'collected' THEN
      RAISE EXCEPTION 'Only mark payment received after delivery and receiving the money.' USING ERRCODE='22023'; END IF;
    previous_value := current_order.payment_status;
    UPDATE public.voss_orders SET payment_status='collected' WHERE id=p_order_id;
  ELSIF p_action='courier' THEN
    IF current_order.status IN ('cancelled','returned','refused','delivered') THEN RAISE EXCEPTION 'This order is closed.' USING ERRCODE='22023'; END IF;
    previous_value := current_order.courier_name || ' / ' || current_order.tracking_number;
    UPDATE public.voss_orders SET courier_name=trim(p_courier),tracking_number=trim(p_tracking) WHERE id=p_order_id;
    p_value := trim(p_courier) || ' / ' || trim(p_tracking);
  ELSE
    IF length(trim(p_note))=0 THEN RAISE EXCEPTION 'Write a note first.' USING ERRCODE='22023'; END IF;
  END IF;
  UPDATE public.voss_orders SET version=version+1 WHERE id=p_order_id;
  INSERT INTO public.voss_business_events(order_id,actor_id,action,old_value,new_value,note)
    VALUES(p_order_id,auth.uid(),p_action,previous_value,p_value,trim(p_note));
  RETURN voss_private.business_read('detail','','all',0,p_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION voss_private.business_read(
  p_view text, p_search text, p_status text, p_page integer, p_order_id uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb; rows_json jsonb; total_count integer;
BEGIN
  PERFORM voss_private.require_owner();
  IF p_view IS NULL OR p_view NOT IN ('overview','orders','detail','products') OR p_page IS NULL OR p_page < 0 OR p_page > 10000
     OR p_search IS NULL OR length(p_search) > 100 OR p_status IS NULL
     OR p_status NOT IN ('all','received','confirmed','packed','shipped','delivered','cancelled','returned','refused')
  THEN RAISE EXCEPTION 'Invalid filters' USING ERRCODE='22023'; END IF;
  IF p_view = 'products' THEN
    SELECT coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object('variants',(
      SELECT coalesce(jsonb_agg(to_jsonb(v) || jsonb_build_object('image_url',(
        SELECT i.white_url FROM public.voss_images i WHERE i.product_slug=v.product_slug AND i.colour_key=v.colour_key ORDER BY i.position LIMIT 1
      )) ORDER BY v.colour_name),'[]'::jsonb) FROM public.voss_variants v WHERE v.product_slug=p.slug
    )) ORDER BY p.article),'[]'::jsonb) INTO result FROM public.voss_products p;
    RETURN jsonb_build_object('products',result);
  END IF;
  IF p_view = 'detail' THEN
    SELECT to_jsonb(o) - 'request_hash' - 'idempotency_key' || jsonb_build_object(
      'items',(SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.name,i.colour_name),'[]'::jsonb) FROM public.voss_order_items i WHERE i.order_id=o.id),
      'events',(SELECT coalesce(jsonb_agg(to_jsonb(e) - 'actor_id' ORDER BY e.created_at DESC,e.id DESC),'[]'::jsonb) FROM public.voss_business_events e WHERE e.order_id=o.id),
      'alert_state',(SELECT n.state FROM public.voss_notification_outbox n WHERE n.order_id=o.id)
    ) INTO result FROM public.voss_orders o WHERE o.id=p_order_id;
    IF result IS NULL THEN RAISE EXCEPTION 'Order not found' USING ERRCODE='P0002'; END IF;
    RETURN result;
  END IF;
  SELECT count(*)::integer INTO total_count FROM public.voss_orders o
    WHERE (p_status='all' OR o.status=p_status) AND (p_search='' OR
      strpos(lower(o.reference || ' ' || o.customer_name || ' ' || o.phone),lower(p_search))>0);
  SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY o.created_at DESC,o.id DESC),'[]'::jsonb) INTO rows_json FROM (
    SELECT x.id,x.reference,x.customer_name,x.phone,x.city,x.status,x.payment_status,x.total_pkr,x.created_at,x.version,
      (SELECT coalesce(jsonb_agg(jsonb_build_object('name',i.name,'colour_name',i.colour_name,'image_url',i.image_url,'quantity',i.quantity,'unit_price_pkr',i.unit_price_pkr) ORDER BY i.name),'[]'::jsonb)
       FROM public.voss_order_items i WHERE i.order_id=x.id) AS items
    FROM public.voss_orders x WHERE (p_status='all' OR x.status=p_status) AND (p_search='' OR
      strpos(lower(x.reference || ' ' || x.customer_name || ' ' || x.phone),lower(p_search))>0)
    ORDER BY x.created_at DESC,x.id DESC LIMIT 25 OFFSET p_page*25
  ) o;
  SELECT jsonb_build_object(
    'total',count(*), 'received',count(*) FILTER(WHERE status='received'),
    'to_pack',count(*) FILTER(WHERE status IN ('confirmed','packed')),
    'shipped',count(*) FILTER(WHERE status='shipped'),
    'pending_cod',coalesce(sum(total_pkr) FILTER(WHERE payment_status='pending' AND status NOT IN ('cancelled','returned','refused')),0),
    'collected',coalesce(sum(total_pkr) FILTER(WHERE payment_status='collected' AND status='delivered'),0),
    'delivered',count(*) FILTER(WHERE status='delivered')
  ) INTO result FROM public.voss_orders;
  RETURN jsonb_build_object('orders',rows_json,'total',total_count,'metrics',result,
    'promotion',(SELECT to_jsonb(p) FROM public.voss_promotions p WHERE code='FIRST30'),
    'alerts',jsonb_build_object('pending',(SELECT count(*) FROM public.voss_notification_outbox WHERE state IN ('pending','failed')),
      'sent',(SELECT count(*) FROM public.voss_notification_outbox WHERE state='sent')));
END;
$$;
