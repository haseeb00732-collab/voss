-- Published Instagram sale: 3–16 November 2026, Pakistan time.
-- Preserve regular prices and historical orders; price new quotes/orders only.
DO $migration$
DECLARE f record; expression text := $price$(CASE WHEN now() >= '2026-11-03 00:00:00+05'::timestamptz AND now() < '2026-11-17 00:00:00+05'::timestamptz THEN CASE p.slug WHEN 'floral-embossed-tote' THEN 3509 WHEN 'chevron-quilted-satchel' THEN 3689 WHEN 'textured-dome-satchel' THEN 3644 WHEN 'two-tone-bag-set' THEN 3374 WHEN 'chic' THEN 2699 ELSE p.price_pkr END ELSE p.price_pkr END) AS price_pkr$price$;
BEGIN
  FOR f IN SELECT pg_get_functiondef(oid) AS definition FROM pg_proc
    WHERE pronamespace='public'::regnamespace AND proname IN ('voss_checkout_quote','voss_checkout_place')
  LOOP
    IF position('p.name, p.price_pkr, v.colour_name' in f.definition)=0 THEN
      RAISE EXCEPTION 'Unexpected checkout definition; inspect before applying sale';
    END IF;
    EXECUTE replace(f.definition,'p.name, p.price_pkr, v.colour_name','p.name, ' || expression || ', v.colour_name');
  END LOOP;
END $migration$;
