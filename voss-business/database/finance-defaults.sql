-- Additive shared settings. Existing ledger, order costs and history are untouched.
CREATE TABLE IF NOT EXISTS voss_private.finance_defaults (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), version integer NOT NULL DEFAULT 1,
 packaging_per_bag numeric(12,2), courier_per_order numeric(12,2), cod_per_order numeric(12,2),
 marketing_per_bag numeric(12,2), customer_delivery_pkr numeric(12,2) NOT NULL DEFAULT 150,
 packaging_mode text NOT NULL DEFAULT 'expense' CHECK(packaging_mode IN ('expense','order')),
 updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid REFERENCES auth.users(id),
 CHECK(packaging_per_bag BETWEEN 0 AND 99999999), CHECK(courier_per_order BETWEEN 0 AND 99999999),
 CHECK(cod_per_order BETWEEN 0 AND 99999999), CHECK(marketing_per_bag BETWEEN 0 AND 99999999),
 CHECK(customer_delivery_pkr BETWEEN 0 AND 99999999)
);
ALTER TABLE voss_private.finance_defaults ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.finance_defaults FROM PUBLIC,anon,authenticated;
-- Rs150 is the confirmed customer delivery fee, not the unknown courier expense.
INSERT INTO voss_private.finance_defaults(id) VALUES(true) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION voss_private.finance_defaults_read() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM voss_private.require_member();
 RETURN (SELECT to_jsonb(d)-'id' FROM voss_private.finance_defaults d WHERE id);
END $$;
CREATE OR REPLACE FUNCTION voss_private.finance_defaults_save(p_entry jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE previous voss_private.finance_defaults%ROWTYPE; next_row voss_private.finance_defaults%ROWTYPE;
 d jsonb:=p_entry->'defaults'; k text; value numeric;
BEGIN
 PERFORM voss_private.require_owner();
 IF jsonb_typeof(d) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Enter the shared costs.'; END IF;
 SELECT * INTO previous FROM voss_private.finance_defaults WHERE id FOR UPDATE;
 IF (p_entry->>'version')::integer IS DISTINCT FROM previous.version THEN
  RAISE EXCEPTION 'Shared costs changed. Refresh before saving.' USING ERRCODE='40001';
 END IF;
 FOREACH k IN ARRAY ARRAY['packaging_per_bag','courier_per_order','cod_per_order','marketing_per_bag','customer_delivery_pkr'] LOOP
  IF d->>k IS NOT NULL THEN
   IF (d->>k)!~'^\d+(\.\d{1,2})?$' THEN RAISE EXCEPTION 'Use rupee amounts with up to two decimals.'; END IF;
   value:=(d->>k)::numeric;
   IF value<0 OR value>99999999 THEN RAISE EXCEPTION 'Cost is outside the supported range.'; END IF;
  END IF;
 END LOOP;
 IF d->>'customer_delivery_pkr' IS NULL OR coalesce(d->>'packaging_mode','') NOT IN ('expense','order') THEN RAISE EXCEPTION 'Check delivery and packaging settings.'; END IF;
 UPDATE voss_private.finance_defaults SET
  packaging_per_bag=(d->>'packaging_per_bag')::numeric,
  courier_per_order=(d->>'courier_per_order')::numeric,
  cod_per_order=(d->>'cod_per_order')::numeric,
  marketing_per_bag=(d->>'marketing_per_bag')::numeric,
  customer_delivery_pkr=(d->>'customer_delivery_pkr')::numeric,
  packaging_mode=d->>'packaging_mode',version=previous.version+1,updated_at=now(),updated_by=auth.uid()
 WHERE id RETURNING * INTO next_row;
 INSERT INTO voss_private.finance_audit(entity,entity_id,actor_id,old_value,new_value)
 VALUES('shared_costs','voss',auth.uid(),to_jsonb(previous),to_jsonb(next_row));
 RETURN to_jsonb(next_row)-'id';
END $$;
REVOKE ALL ON FUNCTION voss_private.finance_defaults_read(),voss_private.finance_defaults_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION voss_private.finance_defaults_read(),voss_private.finance_defaults_save(jsonb) TO authenticated;
-- Preserve existing public RPC names and their security-invoker delegation.
CREATE OR REPLACE FUNCTION public.voss_finance_read(p_from date DEFAULT NULL,p_to date DEFAULT NULL) RETURNS jsonb
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 SELECT voss_private.finance_read(p_from,p_to)||jsonb_build_object('defaults',voss_private.finance_defaults_read())
$$;
CREATE OR REPLACE FUNCTION public.voss_finance_save(p_entry jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF p_entry->>'action'='save_defaults' THEN RETURN voss_private.finance_defaults_save(p_entry); END IF;
 RETURN voss_private.finance_save(p_entry);
END $$;
REVOKE ALL ON FUNCTION public.voss_finance_read(date,date),public.voss_finance_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.voss_finance_read(date,date),public.voss_finance_save(jsonb) TO authenticated;
