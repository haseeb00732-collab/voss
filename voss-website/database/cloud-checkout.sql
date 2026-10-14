CREATE OR REPLACE FUNCTION public.voss_checkout_place(p_idempotency uuid, p_request_hash text, p_customer jsonb, p_lines jsonb, p_expected_total integer)
 RETURNS TABLE(reference text, subtotal integer, delivery integer, total integer, free_delivery boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid := gen_random_uuid();
  v_reference text := 'VOSS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  v_items jsonb;
  v_subtotal integer;
  v_expected_count integer;
  v_matched_count integer;
  v_delivery integer;
  v_used integer;
  v_maximum integer;
  v_recent integer;
  v_existing record;
  v_item record;
BEGIN
  IF p_expected_total IS NULL OR p_expected_total <= 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'Review your order total first.';
  END IF;
  IF jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 OR jsonb_array_length(p_lines) > 50 THEN
    RAISE EXCEPTION USING MESSAGE = 'Choose at least one bag (maximum 50 selections).';
  END IF;
  IF coalesce(p_customer->>'name','') = '' OR coalesce(p_customer->>'phone','') = '' OR coalesce(p_customer->>'address','') = '' THEN
    RAISE EXCEPTION USING MESSAGE = 'Add your delivery details.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_idempotency::text, 0));
  SELECT * INTO v_existing FROM voss_orders WHERE idempotency_key = p_idempotency;
  IF FOUND THEN
    IF v_existing.request_hash <> p_request_hash THEN
      RAISE EXCEPTION USING MESSAGE = 'This order attempt has already been used. Start a new checkout.';
    END IF;
    reference := v_existing.reference;
    subtotal := v_existing.subtotal_pkr;
    delivery := v_existing.delivery_pkr;
    total := v_existing.total_pkr;
    free_delivery := coalesce(v_existing.promotion_code = 'FIRST30', false);
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT used, maximum INTO v_used, v_maximum FROM voss_promotions WHERE code = 'FIRST30' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'The delivery offer is being prepared.';
  END IF;
  v_delivery := CASE WHEN v_used < v_maximum THEN 0 ELSE 150 END;

  SELECT count(*) INTO v_recent FROM voss_orders
  WHERE phone = p_customer->>'phone' AND created_at > now() - interval '1 hour';
  IF v_recent >= 3 THEN
    RAISE EXCEPTION USING MESSAGE = 'You have already placed several orders. Contact VOSS for help before ordering again.';
  END IF;

  SELECT jsonb_array_length(p_lines) INTO v_expected_count;
  WITH requested AS (
    SELECT slug, colour, quantity
    FROM jsonb_to_recordset(p_lines) AS line(slug text, colour text, quantity integer)
  ), priced AS (
    SELECT r.slug, r.colour, r.quantity, p.name, p.price_pkr, v.colour_name, i.white_url
    FROM requested r
    JOIN voss_products p ON p.slug = r.slug AND p.active
    JOIN voss_variants v ON v.product_slug = p.slug AND v.colour_key = r.colour AND v.active
    JOIN voss_images i ON i.product_slug = p.slug AND i.colour_key = v.colour_key AND i.position = 0
    WHERE r.quantity BETWEEN 1 AND 20
  )
  SELECT count(*), coalesce(sum(quantity * price_pkr), 0)::integer,
    jsonb_agg(jsonb_build_object(
      'slug', slug, 'colour', colour, 'quantity', quantity, 'name', name,
      'colourName', colour_name, 'image', white_url, 'unitPrice', price_pkr
    ) ORDER BY slug, colour)
  INTO v_matched_count, v_subtotal, v_items
  FROM priced;

  IF v_matched_count <> v_expected_count THEN
    RAISE EXCEPTION USING MESSAGE = 'One of your selections is unavailable. Please update your bag.';
  END IF;
  IF p_expected_total <> v_subtotal + v_delivery THEN
    RAISE EXCEPTION USING MESSAGE = 'Your total has changed. Please review the updated price and delivery before placing your order.';
  END IF;

  INSERT INTO voss_orders(
    id, reference, idempotency_key, request_hash, customer_name, phone, email, address, city, province, postcode, notes,
    payment_method, subtotal_pkr, delivery_pkr, total_pkr, promotion_code
  ) VALUES (
    v_id, v_reference, p_idempotency, p_request_hash,
    p_customer->>'name', p_customer->>'phone', nullif(p_customer->>'email',''), p_customer->>'address',
    'Lahore', 'Punjab', nullif(p_customer->>'postcode',''), coalesce(p_customer->>'notes',''),
    'cod', v_subtotal, v_delivery, v_subtotal + v_delivery, CASE WHEN v_delivery = 0 THEN 'FIRST30' ELSE NULL END
  );

  FOR v_item IN
    SELECT * FROM jsonb_to_recordset(v_items) AS item(
      slug text, colour text, quantity integer, name text, "colourName" text, image text, "unitPrice" integer
    )
  LOOP
    INSERT INTO voss_order_items(order_id, product_slug, colour_key, name, colour_name, image_url, quantity, unit_price_pkr)
    VALUES (v_id, v_item.slug, v_item.colour, v_item.name, v_item."colourName", v_item.image, v_item.quantity, v_item."unitPrice");
  END LOOP;
  IF v_delivery = 0 THEN UPDATE voss_promotions SET used = used + 1 WHERE code = 'FIRST30'; END IF;

  reference := v_reference;
  subtotal := v_subtotal;
  delivery := v_delivery;
  total := v_subtotal + v_delivery;
  free_delivery := v_delivery = 0;
  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.voss_checkout_quote(p_lines jsonb)
 RETURNS TABLE(items jsonb, subtotal integer, delivery integer, total integer, free_delivery boolean, remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_items jsonb;
  v_subtotal integer;
  v_used integer;
  v_maximum integer;
  v_input_count integer;
  v_matched_count integer;
BEGIN
  IF jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 OR jsonb_array_length(p_lines) > 50 THEN
    RAISE EXCEPTION USING MESSAGE = 'Choose at least one bag (maximum 50 selections).';
  END IF;

  SELECT jsonb_array_length(p_lines) INTO v_input_count;
  WITH requested AS (
    SELECT slug, colour, quantity
    FROM jsonb_to_recordset(p_lines) AS line(slug text, colour text, quantity integer)
  ), priced AS (
    SELECT r.slug, r.colour, r.quantity, p.name, p.price_pkr, v.colour_name, i.white_url
    FROM requested r
    JOIN voss_products p ON p.slug = r.slug AND p.active
    JOIN voss_variants v ON v.product_slug = p.slug AND v.colour_key = r.colour AND v.active
    JOIN voss_images i ON i.product_slug = p.slug AND i.colour_key = v.colour_key AND i.position = 0
    WHERE r.quantity BETWEEN 1 AND 20
  )
  SELECT count(*),
    coalesce(sum(quantity * price_pkr), 0)::integer,
    jsonb_agg(jsonb_build_object(
      'slug', slug, 'colour', colour, 'quantity', quantity, 'name', name,
      'colourName', colour_name, 'image', white_url, 'unitPrice', price_pkr
    ) ORDER BY slug, colour)
  INTO v_matched_count, v_subtotal, v_items
  FROM priced;

  IF v_matched_count <> v_input_count THEN
    RAISE EXCEPTION USING MESSAGE = 'One of your selections is unavailable. Please update your bag.';
  END IF;

  SELECT used, maximum INTO v_used, v_maximum FROM voss_promotions WHERE code = 'FIRST30';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'The delivery offer is being prepared.';
  END IF;
  remaining := greatest(0, v_maximum - v_used);
  items := v_items;
  subtotal := v_subtotal;
  delivery := CASE WHEN remaining > 0 THEN 0 ELSE 150 END;
  total := v_subtotal + delivery;
  free_delivery := remaining > 0;
  RETURN NEXT;
END;
$function$;

REVOKE ALL ON FUNCTION public.voss_checkout_quote(jsonb), public.voss_checkout_place(uuid,text,jsonb,jsonb,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.voss_checkout_quote(jsonb), public.voss_checkout_place(uuid,text,jsonb,jsonb,integer) TO service_role;
