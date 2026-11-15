-- Update the existing limited-time prices without touching regular prices or orders.
DO $migration$
DECLARE
  checkout_function record;
  new_prices text := $prices$WHEN 'floral-embossed-tote' THEN 3509 WHEN 'chevron-quilted-satchel' THEN 3689 WHEN 'textured-dome-satchel' THEN 3644 WHEN 'two-tone-bag-set' THEN 3374 WHEN 'chic' THEN 2699$prices$;
  old_prices text := $prices$WHEN 'floral-embossed-tote' THEN 2729 WHEN 'chevron-quilted-satchel' THEN 2869 WHEN 'textured-dome-satchel' THEN 2834 WHEN 'two-tone-bag-set' THEN 2624 WHEN 'chic' THEN 2099$prices$;
  updated integer := 0;
BEGIN
  FOR checkout_function IN SELECT pg_get_functiondef(oid) AS definition FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND proname IN ('voss_checkout_quote', 'voss_checkout_place')
  LOOP
    IF position(old_prices in checkout_function.definition) = 0 THEN
      RAISE EXCEPTION 'Unexpected checkout pricing before November sale update';
    END IF;
    EXECUTE replace(checkout_function.definition, old_prices, new_prices);
    updated := updated + 1;
  END LOOP;
  IF updated <> 2 THEN
    RAISE EXCEPTION 'Expected to update two checkout functions, got %', updated;
  END IF;
END $migration$;
