-- Additive website order cost editor; order status/collection remains in Orders.
CREATE OR REPLACE FUNCTION public.voss_order_finance_read(p_order_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM voss_private.require_owner();
 IF NOT EXISTS(SELECT 1 FROM public.voss_orders WHERE id=p_order_id) THEN RAISE EXCEPTION 'Order not found'; END IF;
 RETURN coalesce((SELECT to_jsonb(f) FROM voss_private.order_financials f WHERE order_id=p_order_id),jsonb_build_object('order_id',p_order_id,'version',0));
END $$;
CREATE OR REPLACE FUNCTION public.voss_order_finance_save(p_row jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE old voss_private.order_financials%ROWTYPE; saved voss_private.order_financials%ROWTYPE; oid uuid; k text;n numeric;
BEGIN
 PERFORM voss_private.require_owner();oid:=(p_row->>'order_id')::uuid;
 PERFORM 1 FROM public.voss_orders WHERE id=oid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
 SELECT * INTO old FROM voss_private.order_financials WHERE order_id=oid FOR UPDATE;
 IF coalesce((p_row->>'version')::integer,0)<>coalesce(old.version,0) THEN RAISE EXCEPTION 'Costs changed. Refresh before saving.' USING ERRCODE='40001'; END IF;
 IF length(trim(coalesce(p_row->>'note','')))<3 OR length(p_row->>'note')>2000 THEN RAISE EXCEPTION 'Add a note explaining these costs'; END IF;
 FOREACH k IN ARRAY ARRAY['product_cost_pkr','packaging_cost_pkr','delivery_cost_pkr','marketing_cost_pkr','other_cost_pkr','cod_fee_pkr','return_courier_pkr','returns_loss_pkr','refund_pkr'] LOOP
  n:=nullif(p_row->>k,'')::numeric;
  IF n<0 OR n>99999999 OR n<>round(n,2) THEN RAISE EXCEPTION 'Costs must be nonnegative PKR with two decimals'; END IF;
 END LOOP;
 IF coalesce((p_row->>'refund_pkr')::numeric,0)>0 AND NOT EXISTS(SELECT 1 FROM public.voss_orders WHERE id=oid AND status='returned' AND payment_status='collected' AND total_pkr>=(p_row->>'refund_pkr')::numeric) THEN RAISE EXCEPTION 'Refund requires a returned collected order and cannot exceed its total'; END IF;
 IF coalesce((p_row->>'refund_pkr')::numeric,0)>0 AND nullif(p_row->>'refund_date','') IS NULL THEN RAISE EXCEPTION 'Enter the refund date'; END IF;
 IF coalesce((p_row->>'costs_paid')::boolean,false) AND nullif(p_row->>'costs_settled_date','') IS NULL THEN RAISE EXCEPTION 'Enter the date these costs were paid'; END IF;
 IF length(coalesce(p_row->>'campaign_key',''))>150 OR length(coalesce(p_row->>'post_id',''))>150 OR length(coalesce(p_row->>'customer_key',''))>150 THEN RAISE EXCEPTION 'Reference too long'; END IF;
 INSERT INTO voss_private.order_financials(order_id,product_cost_pkr,packaging_cost_pkr,delivery_cost_pkr,marketing_cost_pkr,other_cost_pkr,cod_fee_pkr,return_courier_pkr,returns_loss_pkr,refund_pkr,refund_date,costs_complete,costs_paid,costs_settled_date,campaign_key,post_id,customer_key,new_customer,note)
 VALUES(oid,nullif(p_row->>'product_cost_pkr','')::numeric,coalesce((p_row->>'packaging_cost_pkr')::numeric,0),coalesce((p_row->>'delivery_cost_pkr')::numeric,0),coalesce((p_row->>'marketing_cost_pkr')::numeric,0),coalesce((p_row->>'other_cost_pkr')::numeric,0),coalesce((p_row->>'cod_fee_pkr')::numeric,0),coalesce((p_row->>'return_courier_pkr')::numeric,0),coalesce((p_row->>'returns_loss_pkr')::numeric,0),coalesce((p_row->>'refund_pkr')::numeric,0),nullif(p_row->>'refund_date','')::date,coalesce((p_row->>'costs_complete')::boolean,false),coalesce((p_row->>'costs_paid')::boolean,false),nullif(p_row->>'costs_settled_date','')::date,coalesce(p_row->>'campaign_key',''),coalesce(p_row->>'post_id',''),coalesce(p_row->>'customer_key',''),(p_row->>'new_customer')::boolean,trim(p_row->>'note'))
 ON CONFLICT(order_id) DO UPDATE SET product_cost_pkr=excluded.product_cost_pkr,packaging_cost_pkr=excluded.packaging_cost_pkr,delivery_cost_pkr=excluded.delivery_cost_pkr,marketing_cost_pkr=excluded.marketing_cost_pkr,other_cost_pkr=excluded.other_cost_pkr,cod_fee_pkr=excluded.cod_fee_pkr,return_courier_pkr=excluded.return_courier_pkr,returns_loss_pkr=excluded.returns_loss_pkr,refund_pkr=excluded.refund_pkr,refund_date=excluded.refund_date,costs_complete=excluded.costs_complete,costs_paid=excluded.costs_paid,costs_settled_date=excluded.costs_settled_date,campaign_key=excluded.campaign_key,post_id=excluded.post_id,customer_key=excluded.customer_key,new_customer=excluded.new_customer,note=excluded.note,version=order_financials.version+1,updated_at=now() RETURNING * INTO saved;
 RETURN to_jsonb(saved);
END $$;
REVOKE ALL ON FUNCTION public.voss_order_finance_read(uuid),public.voss_order_finance_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.voss_order_finance_read(uuid),public.voss_order_finance_save(jsonb) TO authenticated;
