-- Owner-managed cost names/rates. Saving an item never creates an expense.
CREATE TABLE IF NOT EXISTS voss_private.cost_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),version integer NOT NULL DEFAULT 1,
 name text NOT NULL CHECK(length(trim(name)) BETWEEN 2 AND 100),
 category text NOT NULL CHECK(category IN ('product','packaging','marketing','delivery','content','tools','other')),
 rate_pkr numeric(12,2) CHECK(rate_pkr BETWEEN 0 AND 99999999),
 basis text NOT NULL CHECK(basis IN ('per_item','per_bag','per_order','per_month','one_off')),
 active boolean NOT NULL DEFAULT true,note text NOT NULL DEFAULT '' CHECK(length(note)<=500),
 request_key uuid UNIQUE NOT NULL,request_fingerprint text NOT NULL,source_key text UNIQUE,source_entries text[] NOT NULL DEFAULT '{}',
 created_by uuid REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE voss_private.cost_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.cost_items FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS cost_item_audit ON voss_private.cost_items;
CREATE TRIGGER cost_item_audit AFTER INSERT OR UPDATE ON voss_private.cost_items FOR EACH ROW EXECUTE FUNCTION voss_private.finance_log_change();
CREATE OR REPLACE FUNCTION voss_private.cost_source_name(value text) RETURNS text
LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT CASE lower(replace(trim(value),' ','')) WHEN 'salery' THEN 'salary' WHEN 'salary' THEN 'salary' WHEN 'chtgpt' THEN 'chatgpt' WHEN 'chatgpt' THEN 'chatgpt' ELSE lower(trim(value)) END
$$;
REVOKE ALL ON FUNCTION voss_private.cost_source_name(text) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION voss_private.cost_items_read() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM voss_private.require_member();
 RETURN (SELECT coalesce(jsonb_agg(to_jsonb(c)-'request_key'-'request_fingerprint'-'created_by'||jsonb_build_object(
 'recorded_total_pkr',(SELECT coalesce(sum(e.amount_pkr),0) FROM voss_private.finance_entries e WHERE e.kind='expense' AND e.voided_at IS NULL AND (e.notes LIKE '%Cost item ID: '||c.id::text||'.%' OR e.source_key=ANY(c.source_entries))),
 'recorded_bills',(SELECT count(*) FROM voss_private.finance_entries e WHERE e.kind='expense' AND e.voided_at IS NULL AND (e.notes LIKE '%Cost item ID: '||c.id::text||'.%' OR e.source_key=ANY(c.source_entries)))
 ) ORDER BY active DESC,name),'[]') FROM voss_private.cost_items c);
END $$;
CREATE OR REPLACE FUNCTION voss_private.cost_item_save(p_item jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE old_row voss_private.cost_items%ROWTYPE;new_row voss_private.cost_items%ROWTYPE;fingerprint text:=md5((p_item-'request_key')::text);rate numeric;
BEGIN
 PERFORM voss_private.require_owner();
 IF jsonb_typeof(p_item) IS DISTINCT FROM 'object' OR length(trim(coalesce(p_item->>'name',''))) NOT BETWEEN 2 AND 100 OR
 coalesce(p_item->>'category','') NOT IN ('product','packaging','marketing','delivery','content','tools','other') OR
 coalesce(p_item->>'basis','') NOT IN ('per_item','per_bag','per_order','per_month','one_off') OR
 jsonb_typeof(p_item->'active') IS DISTINCT FROM 'boolean' OR length(coalesce(p_item->>'note',''))>500 THEN RAISE EXCEPTION 'Check the cost name, category, rate and unit.'; END IF;
 IF p_item->>'rate_pkr' IS NOT NULL THEN
  IF (p_item->>'rate_pkr')!~'^\d+(\.\d{1,2})?$' THEN RAISE EXCEPTION 'Use a positive rate with up to two decimals.';END IF;
  rate:=(p_item->>'rate_pkr')::numeric;
  IF rate<0 OR rate>99999999 THEN RAISE EXCEPTION 'Rate outside supported range.';END IF;
 END IF;
 IF p_item->>'id' IS NOT NULL THEN
  SELECT * INTO old_row FROM voss_private.cost_items WHERE id=(p_item->>'id')::uuid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Cost item not found.';END IF;
  IF old_row.version IS DISTINCT FROM (p_item->>'version')::integer THEN RAISE EXCEPTION 'This item changed. Refresh before saving.' USING ERRCODE='40001';END IF;
  UPDATE voss_private.cost_items SET name=trim(p_item->>'name'),category=p_item->>'category',rate_pkr=rate,basis=p_item->>'basis',active=(p_item->>'active')::boolean,note=coalesce(p_item->>'note',''),version=version+1,updated_at=now() WHERE id=old_row.id RETURNING * INTO new_row;
 ELSE
  IF p_item->>'request_key' IS NULL THEN RAISE EXCEPTION 'Request reference required.';END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('voss-cost-item:'||(p_item->>'request_key'),0));
  SELECT * INTO old_row FROM voss_private.cost_items WHERE request_key=(p_item->>'request_key')::uuid;
  IF FOUND THEN
   IF old_row.created_by IS DISTINCT FROM auth.uid() OR old_row.request_fingerprint<>fingerprint THEN RAISE EXCEPTION 'Request reference already used.' USING ERRCODE='40001';END IF;
   RETURN to_jsonb(old_row)-'request_key'-'request_fingerprint'-'created_by';
  END IF;
  INSERT INTO voss_private.cost_items(name,category,rate_pkr,basis,active,note,request_key,request_fingerprint,created_by)
  VALUES(trim(p_item->>'name'),p_item->>'category',rate,p_item->>'basis',(p_item->>'active')::boolean,coalesce(p_item->>'note',''),(p_item->>'request_key')::uuid,fingerprint,auth.uid()) RETURNING * INTO new_row;
 END IF;
 RETURN to_jsonb(new_row)-'request_key'-'request_fingerprint'-'created_by';
END $$;
REVOKE ALL ON FUNCTION voss_private.cost_items_read(),voss_private.cost_item_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION voss_private.cost_items_read(),voss_private.cost_item_save(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.voss_finance_read(p_from date DEFAULT NULL,p_to date DEFAULT NULL) RETURNS jsonb
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 SELECT voss_private.finance_read(p_from,p_to)||jsonb_build_object('defaults',voss_private.finance_defaults_read(),'cost_items',voss_private.cost_items_read())
$$;
CREATE OR REPLACE FUNCTION public.voss_finance_save(p_entry jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF p_entry->>'action'='save_defaults' THEN RETURN voss_private.finance_defaults_save(p_entry);END IF;
 IF p_entry->>'action'='save_cost_item' THEN RETURN voss_private.cost_item_save(p_entry->'item');END IF;
 RETURN voss_private.finance_save(p_entry);
END $$;
REVOKE ALL ON FUNCTION public.voss_finance_read(date,date),public.voss_finance_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.voss_finance_read(date,date),public.voss_finance_save(jsonb) TO authenticated;

-- Reuse the existing imported cost names. Do not post the sheet again or assume
-- that a historical bulk bill is a per-unit rate. Original rows remain unchanged.
INSERT INTO voss_private.cost_items(name,category,rate_pkr,basis,active,note,request_key,request_fingerprint,source_key,source_entries)
SELECT CASE voss_private.cost_source_name(description)
 WHEN 'salary' THEN 'Salary' WHEN 'chatgpt' THEN 'ChatGPT' WHEN 'box small' THEN 'Small boxes'
 WHEN 'box big' THEN 'Large boxes' WHEN 'visiting card' THEN 'Visiting cards'
 WHEN 'voss monogram' THEN 'VOSS monogram' WHEN 'sticker' THEN 'Stickers' WHEN 'add' THEN 'Advertising'
 ELSE min(description) END,category,NULL,'one_off',true,
 'From your original sheet. Actual bills are linked below. Set a usual rate only if you know the unit quantity.',
 gen_random_uuid(),md5(category||':'||voss_private.cost_source_name(description)),category||':'||voss_private.cost_source_name(description),array_agg(source_key)
FROM voss_private.finance_entries WHERE source_key IS NOT NULL AND kind='expense' AND category<>'product' AND NOT EXISTS(SELECT 1 FROM voss_private.cost_items existing WHERE finance_entries.source_key=ANY(existing.source_entries))
GROUP BY category,voss_private.cost_source_name(description) ON CONFLICT(source_key) DO NOTHING;
