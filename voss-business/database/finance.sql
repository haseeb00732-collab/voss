-- Additive owner finance ledger. Apply after cloud-owner.sql and team-access.sql.
-- PKR throughout. Product purchases are cash spending, not automatically COGS.
CREATE TABLE IF NOT EXISTS voss_private.finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version integer NOT NULL DEFAULT 1,
  kind text NOT NULL CHECK(kind IN ('expense','sale')), entry_date date NOT NULL,
  category text NOT NULL CHECK(category IN ('marketing','content','delivery','product','packaging','tools','other')),
  description text NOT NULL CHECK(length(trim(description)) BETWEEN 1 AND 200),
  amount_pkr numeric(14,2) NOT NULL CHECK(amount_pkr > 0 AND amount_pkr<=999999999999.99),
  payer text NOT NULL DEFAULT '' CHECK(length(payer)<=100),
  payment_status text NOT NULL, settled_date date,
  quantity integer NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 100000),
  unit_cost_pkr numeric(14,2) CHECK(unit_cost_pkr BETWEEN 0 AND 999999999999.99),
  cogs_pkr numeric(14,2) CHECK(cogs_pkr BETWEEN 0 AND 999999999999.99),
  product_slug text, colour_key text,
  notes text NOT NULL DEFAULT '' CHECK(length(notes)<=2000),
  source_key text UNIQUE, source_data jsonb,
  date_flag text NOT NULL DEFAULT '',
  voided_at timestamptz, void_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK((kind='expense' AND payment_status IN ('paid','unpaid')) OR
    (kind='sale' AND payment_status IN ('collected','pending'))),
  CHECK((payment_status IN ('paid','collected'))=(settled_date IS NOT NULL)),
  CHECK((product_slug IS NULL)=(colour_key IS NULL)),
  CHECK((voided_at IS NULL AND void_reason='') OR (voided_at IS NOT NULL AND length(trim(void_reason))>=3))
);
CREATE INDEX IF NOT EXISTS finance_entries_date_idx ON voss_private.finance_entries(entry_date DESC);
-- Additional costs are whole-order amounts not already entered as expense rows.
-- Product unit cost remains COGS; inventory purchase cash stays in expense rows.
ALTER TABLE voss_private.finance_entries
  ADD COLUMN IF NOT EXISTS packaging_cost_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(packaging_cost_pkr BETWEEN 0 AND 999999999999.99),
  ADD COLUMN IF NOT EXISTS delivery_cost_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(delivery_cost_pkr BETWEEN 0 AND 999999999999.99),
  ADD COLUMN IF NOT EXISTS marketing_cost_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(marketing_cost_pkr BETWEEN 0 AND 999999999999.99),
  ADD COLUMN IF NOT EXISTS other_cost_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(other_cost_pkr BETWEEN 0 AND 999999999999.99),
  ADD COLUMN IF NOT EXISTS delivery_charged_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(delivery_charged_pkr BETWEEN 0 AND 999999999999.99),
  ADD COLUMN IF NOT EXISTS free_delivery_offer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS costs_paid boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS costs_settled_date date,
  ADD COLUMN IF NOT EXISTS cost_payer text NOT NULL DEFAULT '' CHECK(length(cost_payer)<=100),
  ADD COLUMN IF NOT EXISTS request_key uuid,
  ADD COLUMN IF NOT EXISTS request_fingerprint text;
CREATE UNIQUE INDEX IF NOT EXISTS finance_entries_request_key_idx ON voss_private.finance_entries(request_key) WHERE request_key IS NOT NULL;
CREATE TABLE IF NOT EXISTS voss_private.inventory_counts (
  product_slug text NOT NULL, colour_key text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  stock_on_hand integer CHECK(stock_on_hand BETWEEN 0 AND 1000000),
  unit_cost_pkr numeric(14,2) CHECK(unit_cost_pkr BETWEEN 0 AND 999999999999.99),
  note text NOT NULL DEFAULT '', counted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(product_slug,colour_key),
  FOREIGN KEY(product_slug,colour_key) REFERENCES public.voss_variants(product_slug,colour_key)
);
CREATE TABLE IF NOT EXISTS voss_private.finance_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity text NOT NULL, entity_id text NOT NULL, actor_id uuid REFERENCES auth.users(id),
  old_value jsonb, new_value jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finance_audit_entity_idx ON voss_private.finance_audit(entity,entity_id,id DESC);
CREATE TABLE IF NOT EXISTS voss_private.order_cost_snapshots (
  order_id uuid NOT NULL REFERENCES public.voss_orders(id), product_slug text NOT NULL, colour_key text NOT NULL,
  quantity integer NOT NULL, unit_cost_pkr numeric(14,2), captured_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(order_id,product_slug,colour_key)
);
ALTER TABLE voss_private.finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.finance_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.order_cost_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.finance_entries,voss_private.inventory_counts,voss_private.finance_audit,voss_private.order_cost_snapshots FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION voss_private.finance_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'History is immutable; void ledger entries with a reason instead.' USING ERRCODE='42501'; END;
$$;
REVOKE ALL ON FUNCTION voss_private.finance_immutable() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS finance_audit_immutable ON voss_private.finance_audit;
CREATE TRIGGER finance_audit_immutable BEFORE UPDATE OR DELETE ON voss_private.finance_audit FOR EACH ROW EXECUTE FUNCTION voss_private.finance_immutable();
DROP TRIGGER IF EXISTS finance_no_delete ON voss_private.finance_entries;
CREATE TRIGGER finance_no_delete BEFORE DELETE ON voss_private.finance_entries FOR EACH ROW EXECUTE FUNCTION voss_private.finance_immutable();
DROP TRIGGER IF EXISTS inventory_no_delete ON voss_private.inventory_counts;
CREATE TRIGGER inventory_no_delete BEFORE DELETE ON voss_private.inventory_counts FOR EACH ROW EXECUTE FUNCTION voss_private.finance_immutable();
DROP TRIGGER IF EXISTS order_cost_immutable ON voss_private.order_cost_snapshots;
CREATE TRIGGER order_cost_immutable BEFORE UPDATE OR DELETE ON voss_private.order_cost_snapshots FOR EACH ROW EXECUTE FUNCTION voss_private.finance_immutable();

CREATE OR REPLACE FUNCTION voss_private.finance_log_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE n jsonb:=to_jsonb(NEW); o jsonb;
BEGIN
  IF TG_OP='UPDATE' THEN o:=to_jsonb(OLD); END IF;
  INSERT INTO voss_private.finance_audit(entity,entity_id,actor_id,old_value,new_value)
  VALUES(TG_TABLE_NAME,coalesce(n->>'id',(n->>'product_slug')||':'||(n->>'colour_key')),auth.uid(),o,n);
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION voss_private.finance_log_change() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS finance_log_change ON voss_private.finance_entries;
CREATE TRIGGER finance_log_change AFTER INSERT OR UPDATE ON voss_private.finance_entries FOR EACH ROW EXECUTE FUNCTION voss_private.finance_log_change();
DROP TRIGGER IF EXISTS inventory_log_change ON voss_private.inventory_counts;
CREATE TRIGGER inventory_log_change AFTER INSERT OR UPDATE ON voss_private.inventory_counts FOR EACH ROW EXECUTE FUNCTION voss_private.finance_log_change();

-- Capture known unit cost once, at delivery. Missing historical costs stay unknown.
CREATE OR REPLACE FUNCTION voss_private.finance_capture_order_cost() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.status='delivered' AND OLD.status IS DISTINCT FROM 'delivered' THEN
    INSERT INTO voss_private.order_cost_snapshots(order_id,product_slug,colour_key,quantity,unit_cost_pkr)
    SELECT i.order_id,i.product_slug,i.colour_key,i.quantity,c.unit_cost_pkr
    FROM public.voss_order_items i LEFT JOIN voss_private.inventory_counts c USING(product_slug,colour_key)
    WHERE i.order_id=NEW.id ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION voss_private.finance_capture_order_cost() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS finance_order_cost ON public.voss_orders;
CREATE TRIGGER finance_order_cost AFTER UPDATE OF status ON public.voss_orders FOR EACH ROW EXECUTE FUNCTION voss_private.finance_capture_order_cost();

CREATE OR REPLACE FUNCTION voss_private.finance_save(p_entry jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e voss_private.finance_entries%ROWTYPE; previous voss_private.finance_entries%ROWTYPE;
  entry_id uuid; v_cost numeric; v_amount numeric; v_settled date;
  v_packaging numeric; v_delivery numeric; v_marketing numeric; v_other numeric; v_charged numeric;
  v_free boolean; v_costs_paid boolean; v_costs_settled date; v_extra_total numeric;
  v_used integer; v_maximum integer; v_delta integer; v_request uuid; v_fingerprint text; v_check numeric;
BEGIN
  PERFORM voss_private.require_owner();
  IF p_entry IS NULL OR jsonb_typeof(p_entry)<>'object' THEN RAISE EXCEPTION 'Invalid entry' USING ERRCODE='22023'; END IF;
  -- Promotion first, entry second: same lock order as checkout; all writes atomic.
  SELECT used,maximum INTO v_used,v_maximum FROM public.voss_promotions WHERE code='FIRST30' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'The delivery offer is not configured' USING ERRCODE='22023'; END IF;
  entry_id:=nullif(p_entry->>'id','')::uuid;
  IF entry_id IS NOT NULL THEN
    SELECT * INTO previous FROM voss_private.finance_entries WHERE id=entry_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Entry not found' USING ERRCODE='P0002'; END IF;
    IF (p_entry->>'version')::integer IS DISTINCT FROM previous.version THEN RAISE EXCEPTION 'Entry changed. Refresh before saving.' USING ERRCODE='40001'; END IF;
    IF previous.voided_at IS NOT NULL THEN RAISE EXCEPTION 'Voided entries cannot be edited' USING ERRCODE='22023'; END IF;
    IF p_entry ? 'void_reason' THEN
      IF length(trim(coalesce(p_entry->>'void_reason','')))<3 THEN RAISE EXCEPTION 'Add a reason to void this entry' USING ERRCODE='22023'; END IF;
      IF previous.kind='sale' AND previous.free_delivery_offer THEN
        IF v_used<1 THEN RAISE EXCEPTION 'Delivery offer count is inconsistent; ask the administrator to review it' USING ERRCODE='23514'; END IF;
        UPDATE public.voss_promotions SET used=used-1 WHERE code='FIRST30';
      END IF;
      UPDATE voss_private.finance_entries SET voided_at=now(),void_reason=trim(p_entry->>'void_reason'),version=version+1,updated_at=now() WHERE id=entry_id RETURNING * INTO e;
      RETURN to_jsonb(e)-'request_fingerprint';
    END IF;
  ELSE
    v_request:=nullif(p_entry->>'request_key','')::uuid;
    IF p_entry->>'kind'='sale' AND v_request IS NULL THEN RAISE EXCEPTION 'A new sale requires a request key. Refresh and try again.' USING ERRCODE='22023'; END IF;
    IF v_request IS NOT NULL THEN
      v_fingerprint:=md5((p_entry-'request_key')::text);
      SELECT * INTO e FROM voss_private.finance_entries WHERE request_key=v_request FOR UPDATE;
      IF FOUND THEN
        IF e.request_fingerprint IS DISTINCT FROM v_fingerprint THEN RAISE EXCEPTION 'This sale request was already used with different data. Refresh before saving.' USING ERRCODE='40001'; END IF;
        RETURN to_jsonb(e)-'request_fingerprint';
      END IF;
    END IF;
    entry_id:=gen_random_uuid();
  END IF;
  v_amount:=(p_entry->>'amount_pkr')::numeric;
  v_cost:=nullif(p_entry->>'unit_cost_pkr','')::numeric;
  IF v_amount IS NULL OR v_amount<=0 OR v_amount>999999999999.99 OR v_amount<>round(v_amount,2) OR v_cost<0 OR v_cost>999999999999.99 OR v_cost<>round(v_cost,2)
    OR coalesce(p_entry->>'kind','') NOT IN ('expense','sale')
    OR coalesce(p_entry->>'category','') NOT IN ('marketing','content','delivery','product','packaging','tools','other')
    OR length(trim(coalesce(p_entry->>'description',''))) NOT BETWEEN 1 AND 200
    OR coalesce(p_entry->>'entry_date','')='' THEN RAISE EXCEPTION 'Enter a valid date, category, description and positive PKR amount (maximum two decimals)' USING ERRCODE='22023'; END IF;
  IF (nullif(p_entry->>'product_slug','') IS NULL)<>(nullif(p_entry->>'colour_key','') IS NULL) THEN RAISE EXCEPTION 'Choose a complete product variant' USING ERRCODE='22023'; END IF;
  IF nullif(p_entry->>'product_slug','') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.voss_variants WHERE product_slug=p_entry->>'product_slug' AND colour_key=p_entry->>'colour_key') THEN RAISE EXCEPTION 'Product variant not found' USING ERRCODE='22023'; END IF;
  -- A manual sale is a distinct offline sale; website order references are not accepted.
  IF p_entry ? 'order_id' OR p_entry ? 'source_key' OR p_entry ? 'source_data' THEN RAISE EXCEPTION 'Website sales and import provenance cannot be entered manually' USING ERRCODE='22023'; END IF;
  v_packaging:=coalesce(nullif(p_entry->>'packaging_cost_pkr','')::numeric,0);
  v_delivery:=coalesce(nullif(p_entry->>'delivery_cost_pkr','')::numeric,0);
  v_marketing:=coalesce(nullif(p_entry->>'marketing_cost_pkr','')::numeric,0);
  v_other:=coalesce(nullif(p_entry->>'other_cost_pkr','')::numeric,0);
  v_charged:=coalesce(nullif(p_entry->>'delivery_charged_pkr','')::numeric,0);
  FOREACH v_check IN ARRAY ARRAY[v_packaging,v_delivery,v_marketing,v_other,v_charged] LOOP
    IF v_check<0 OR v_check>999999999999.99 OR v_check<>round(v_check,2) THEN RAISE EXCEPTION 'Order costs and delivery charged must be nonnegative PKR amounts with maximum two decimals' USING ERRCODE='22023'; END IF;
  END LOOP;
  IF (p_entry ? 'free_delivery_offer' AND jsonb_typeof(p_entry->'free_delivery_offer')<>'boolean') OR
     (p_entry ? 'costs_paid' AND jsonb_typeof(p_entry->'costs_paid')<>'boolean') THEN RAISE EXCEPTION 'Choose valid delivery-offer and cost-payment options' USING ERRCODE='22023'; END IF;
  v_free:=coalesce((p_entry->>'free_delivery_offer')::boolean,false);
  v_costs_paid:=coalesce((p_entry->>'costs_paid')::boolean,true);
  v_extra_total:=v_packaging+v_delivery+v_marketing+v_other;
  IF p_entry->>'kind'<>'sale' AND (v_free OR v_extra_total>0 OR v_charged>0) THEN RAISE EXCEPTION 'Order cost breakdown and free delivery apply only to sales' USING ERRCODE='22023'; END IF;
  IF v_free AND v_charged>0 THEN RAISE EXCEPTION 'A free-delivery order cannot charge delivery to the customer' USING ERRCODE='22023'; END IF;
  IF p_entry->>'kind'='sale' AND v_extra_total>0 AND v_costs_paid THEN
    v_costs_settled:=coalesce(nullif(p_entry->>'costs_settled_date','')::date,
      CASE WHEN previous.kind='sale' AND previous.costs_paid AND previous.costs_settled_date IS NOT NULL THEN previous.costs_settled_date
        WHEN previous.id IS NOT NULL AND NOT previous.costs_paid THEN (now() AT TIME ZONE 'Asia/Karachi')::date
        ELSE (p_entry->>'entry_date')::date END);
  END IF;
  IF p_entry->>'payment_status' IN ('paid','collected') THEN
    v_settled:=coalesce(nullif(p_entry->>'settled_date','')::date,
      CASE WHEN previous.payment_status=p_entry->>'payment_status' THEN previous.settled_date
        WHEN previous.id IS NOT NULL THEN (now() AT TIME ZONE 'Asia/Karachi')::date
        ELSE (p_entry->>'entry_date')::date END);
  END IF;
  IF p_entry->>'kind'='sale' AND v_cost IS NULL AND nullif(p_entry->>'product_slug','') IS NOT NULL THEN
    IF previous.id IS NOT NULL AND previous.product_slug IS NOT DISTINCT FROM nullif(p_entry->>'product_slug','') AND previous.colour_key IS NOT DISTINCT FROM nullif(p_entry->>'colour_key','') THEN
      v_cost:=previous.unit_cost_pkr;
    ELSE
      SELECT unit_cost_pkr INTO v_cost FROM voss_private.inventory_counts WHERE product_slug=p_entry->>'product_slug' AND colour_key=p_entry->>'colour_key';
    END IF;
  END IF;
  v_delta:=(CASE WHEN p_entry->>'kind'='sale' AND v_free THEN 1 ELSE 0 END)-(CASE WHEN previous.kind='sale' AND previous.free_delivery_offer THEN 1 ELSE 0 END);
  IF v_used+v_delta>v_maximum THEN RAISE EXCEPTION 'The first-30 free-delivery offer is fully used. Clear the offer flag or review the order.' USING ERRCODE='22023'; END IF;
  IF v_used+v_delta<0 THEN RAISE EXCEPTION 'Delivery offer count is inconsistent; ask the administrator to review it' USING ERRCODE='23514'; END IF;
  IF v_delta<>0 THEN UPDATE public.voss_promotions SET used=used+v_delta WHERE code='FIRST30'; END IF;
  INSERT INTO voss_private.finance_entries(id,kind,entry_date,category,description,amount_pkr,payer,payment_status,settled_date,quantity,unit_cost_pkr,cogs_pkr,product_slug,colour_key,notes,date_flag,
    packaging_cost_pkr,delivery_cost_pkr,marketing_cost_pkr,other_cost_pkr,delivery_charged_pkr,free_delivery_offer,costs_paid,costs_settled_date,cost_payer,request_key,request_fingerprint)
  VALUES(entry_id,p_entry->>'kind',(p_entry->>'entry_date')::date,p_entry->>'category',trim(p_entry->>'description'),v_amount,trim(coalesce(p_entry->>'payer','')),
    p_entry->>'payment_status',v_settled,coalesce((p_entry->>'quantity')::integer,1),v_cost,
    CASE WHEN p_entry->>'kind'='sale' THEN v_cost*coalesce((p_entry->>'quantity')::integer,1) END,
    nullif(p_entry->>'product_slug',''),nullif(p_entry->>'colour_key',''),coalesce(p_entry->>'notes',''),
    CASE WHEN (p_entry->>'entry_date')::date>(now() AT TIME ZONE 'Asia/Karachi')::date THEN 'Future date: confirm against source' ELSE '' END,
    v_packaging,v_delivery,v_marketing,v_other,v_charged,v_free,v_costs_paid,v_costs_settled,trim(coalesce(p_entry->>'cost_payer','')),v_request,v_fingerprint)
  ON CONFLICT(id) DO UPDATE SET kind=EXCLUDED.kind,entry_date=EXCLUDED.entry_date,category=EXCLUDED.category,description=EXCLUDED.description,
    amount_pkr=EXCLUDED.amount_pkr,payer=EXCLUDED.payer,payment_status=EXCLUDED.payment_status,settled_date=EXCLUDED.settled_date,quantity=EXCLUDED.quantity,
    unit_cost_pkr=EXCLUDED.unit_cost_pkr,cogs_pkr=EXCLUDED.cogs_pkr,product_slug=EXCLUDED.product_slug,colour_key=EXCLUDED.colour_key,
    notes=EXCLUDED.notes,date_flag=EXCLUDED.date_flag,packaging_cost_pkr=EXCLUDED.packaging_cost_pkr,delivery_cost_pkr=EXCLUDED.delivery_cost_pkr,
    marketing_cost_pkr=EXCLUDED.marketing_cost_pkr,other_cost_pkr=EXCLUDED.other_cost_pkr,delivery_charged_pkr=EXCLUDED.delivery_charged_pkr,
    free_delivery_offer=EXCLUDED.free_delivery_offer,costs_paid=EXCLUDED.costs_paid,costs_settled_date=EXCLUDED.costs_settled_date,cost_payer=EXCLUDED.cost_payer,
    version=finance_entries.version+1,updated_at=now()
  RETURNING * INTO e;
  RETURN to_jsonb(e)-'request_fingerprint';
END; $$;

CREATE OR REPLACE FUNCTION voss_private.inventory_save(p_item jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_item voss_private.inventory_counts%ROWTYPE; saved voss_private.inventory_counts%ROWTYPE; v_cost numeric;
BEGIN
  PERFORM voss_private.require_owner();
  IF p_item IS NULL OR jsonb_typeof(p_item)<>'object' OR length(trim(coalesce(p_item->>'note','')))<3 OR length(p_item->>'note')>2000 THEN RAISE EXCEPTION 'Add a note explaining this physical count or cost change' USING ERRCODE='22023'; END IF;
  -- Serialize first creation and updates for a variant, including version zero.
  PERFORM 1 FROM public.voss_variants WHERE product_slug=p_item->>'product_slug' AND colour_key=p_item->>'colour_key' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product variant not found' USING ERRCODE='22023'; END IF;
  SELECT * INTO current_item FROM voss_private.inventory_counts WHERE product_slug=p_item->>'product_slug' AND colour_key=p_item->>'colour_key' FOR UPDATE;
  IF (p_item->>'version')::integer IS DISTINCT FROM coalesce(current_item.version,0) THEN RAISE EXCEPTION 'Inventory changed. Refresh before saving.' USING ERRCODE='40001'; END IF;
  v_cost:=nullif(p_item->>'unit_cost_pkr','')::numeric;
  IF v_cost<0 OR v_cost>999999999999.99 OR v_cost<>round(v_cost,2) THEN RAISE EXCEPTION 'Unit cost must be nonnegative with maximum two decimals' USING ERRCODE='22023'; END IF;
  INSERT INTO voss_private.inventory_counts(product_slug,colour_key,stock_on_hand,unit_cost_pkr,note)
  VALUES(p_item->>'product_slug',p_item->>'colour_key',nullif(p_item->>'stock_on_hand','')::integer,v_cost,trim(p_item->>'note'))
  ON CONFLICT(product_slug,colour_key) DO UPDATE SET stock_on_hand=EXCLUDED.stock_on_hand,unit_cost_pkr=EXCLUDED.unit_cost_pkr,note=EXCLUDED.note,version=inventory_counts.version+1,counted_at=now()
  RETURNING * INTO saved;
  RETURN to_jsonb(saved);
END; $$;

CREATE OR REPLACE FUNCTION voss_private.finance_read(p_from date,p_to date) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb; summary_json jsonb; weeks_json jsonb; inventory_json jsonb;
BEGIN
  PERFORM voss_private.require_owner();
  IF p_from IS NOT NULL AND p_to IS NOT NULL AND p_from>p_to THEN RAISE EXCEPTION 'Start date must be before end date' USING ERRCODE='22023'; END IF;
  -- Revenue is booked at delivery; cash is booked when collection was recorded.
  -- Legacy delivery history predates business events; use it before order date.
  -- Only orders without either record fall back to order date, counted below.
  WITH website AS (
    SELECT o.*, (coalesce((SELECT min(e.created_at) FROM public.voss_business_events e WHERE e.order_id=o.id AND e.action='status' AND e.new_value='delivered'),
      (SELECT min(h.changed_at) FROM public.voss_order_history h WHERE h.order_id=o.id AND h.new_status='delivered'),o.created_at) AT TIME ZONE 'Asia/Karachi')::date delivered_date,
      (coalesce((SELECT min(e.created_at) FROM public.voss_business_events e WHERE e.order_id=o.id AND e.action='payment' AND e.new_value='collected'),o.created_at) AT TIME ZONE 'Asia/Karachi')::date collected_date,
      (NOT EXISTS(SELECT 1 FROM public.voss_business_events e WHERE e.order_id=o.id AND e.action='status' AND e.new_value='delivered') AND
        NOT EXISTS(SELECT 1 FROM public.voss_order_history h WHERE h.order_id=o.id AND h.new_status='delivered')) AS estimated_date,
      (SELECT sum(s.quantity*s.unit_cost_pkr) FROM voss_private.order_cost_snapshots s WHERE s.order_id=o.id) AS cogs,
      (NOT EXISTS(SELECT 1 FROM public.voss_order_items i WHERE i.order_id=o.id) OR EXISTS(SELECT 1 FROM public.voss_order_items i LEFT JOIN voss_private.order_cost_snapshots s USING(order_id,product_slug,colour_key) WHERE i.order_id=o.id AND s.unit_cost_pkr IS NULL)) AS missing_cost
    FROM public.voss_orders o
  ), events AS (
    SELECT f.entry_date AS d,CASE WHEN f.kind='sale' THEN f.amount_pkr+f.delivery_charged_pkr ELSE 0 END AS revenue,
      0::numeric AS website_revenue,CASE WHEN f.kind='sale' THEN f.amount_pkr+f.delivery_charged_pkr ELSE 0 END AS manual_revenue,
      0::numeric AS cash_collected,
      CASE WHEN f.kind='expense' THEN f.amount_pkr ELSE f.packaging_cost_pkr+f.delivery_cost_pkr+f.marketing_cost_pkr+f.other_cost_pkr END AS expenses,
      0::numeric AS cash_spent,
      CASE WHEN f.kind='expense' AND f.category='product' THEN f.amount_pkr ELSE 0 END AS product_purchases,
      coalesce(f.cogs_pkr,0) AS known_cogs, CASE WHEN f.kind='sale' AND f.cogs_pkr IS NULL THEN 1 ELSE 0 END AS missing_cost_sales,
      CASE WHEN f.kind='sale' THEN 1 ELSE 0 END AS sale_count,0 AS pending_cod,0 AS estimated_order_dates,
      CASE WHEN f.kind='sale' THEN f.delivery_charged_pkr ELSE 0 END AS delivery_revenue
    FROM voss_private.finance_entries f WHERE f.voided_at IS NULL
    UNION ALL
    SELECT settled_date,0,0,0,CASE WHEN kind='sale' THEN amount_pkr+delivery_charged_pkr ELSE 0 END,0,
      CASE WHEN kind='expense' THEN amount_pkr ELSE 0 END,0,0,0,0,0,0,0
    FROM voss_private.finance_entries WHERE voided_at IS NULL AND settled_date IS NOT NULL
    UNION ALL
    SELECT costs_settled_date,0,0,0,0,0,packaging_cost_pkr+delivery_cost_pkr+marketing_cost_pkr+other_cost_pkr,0,0,0,0,0,0,0
    FROM voss_private.finance_entries WHERE kind='sale' AND voided_at IS NULL AND costs_paid AND costs_settled_date IS NOT NULL
    UNION ALL
    SELECT delivered_date,total_pkr,total_pkr,0,0,0,0,0,coalesce(cogs,0),missing_cost::integer,1,
      CASE WHEN payment_status='pending' THEN total_pkr ELSE 0 END,estimated_date::integer,delivery_pkr FROM website WHERE status='delivered'
    UNION ALL
    SELECT collected_date,0,0,0,total_pkr,0,0,0,0,0,0,0,0,0 FROM website WHERE status='delivered' AND payment_status='collected'
  ), filtered AS (SELECT * FROM events WHERE (p_from IS NULL OR d>=p_from) AND (p_to IS NULL OR d<=p_to)), aggregates AS (
    SELECT NULL::date AS week_start,coalesce(sum(revenue),0) AS revenue_pkr,coalesce(sum(website_revenue),0) AS website_revenue_pkr,
      coalesce(sum(manual_revenue),0) AS manual_revenue_pkr,coalesce(sum(cash_collected),0) AS cash_collected_pkr,
      coalesce(sum(expenses),0) AS expenses_pkr,coalesce(sum(cash_spent),0) AS cash_spent_pkr,coalesce(sum(product_purchases),0) AS product_purchases_pkr,
      coalesce(sum(known_cogs),0) AS known_cogs_pkr,coalesce(sum(missing_cost_sales),0) AS missing_cost_sales,
      coalesce(sum(sale_count),0) AS sale_count,coalesce(sum(pending_cod),0) AS pending_cod_pkr,
      coalesce(sum(estimated_order_dates),0) AS estimated_order_dates,coalesce(sum(delivery_revenue),0) AS delivery_revenue_pkr FROM filtered
    UNION ALL
    SELECT date_trunc('week',d)::date,sum(revenue),sum(website_revenue),sum(manual_revenue),sum(cash_collected),sum(expenses),sum(cash_spent),sum(product_purchases),sum(known_cogs),sum(missing_cost_sales),sum(sale_count),sum(pending_cod),sum(estimated_order_dates),sum(delivery_revenue) FROM filtered GROUP BY date_trunc('week',d)::date
  ), reports AS (
    SELECT a.*,expenses_pkr-product_purchases_pkr AS operating_expenses_pkr,cash_collected_pkr-cash_spent_pkr AS cash_balance_pkr,
      CASE WHEN missing_cost_sales=0 THEN revenue_pkr-known_cogs_pkr END AS gross_profit_estimate_pkr,
      CASE WHEN missing_cost_sales=0 THEN revenue_pkr-known_cogs_pkr-(expenses_pkr-product_purchases_pkr) END AS net_profit_estimate_pkr FROM aggregates a
  ) SELECT (SELECT to_jsonb(r)-'week_start' FROM reports r WHERE week_start IS NULL),
      (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY week_start DESC),'[]') FROM reports r WHERE week_start IS NOT NULL)
    INTO summary_json,weeks_json;
  SELECT coalesce(jsonb_agg(jsonb_build_object('product_slug',v.product_slug,'colour_key',v.colour_key,'name',p.name,'article',p.article,'colour_name',v.colour_name,
    'version',coalesce(c.version,0),'stock_on_hand',c.stock_on_hand,'unit_cost_pkr',c.unit_cost_pkr,'note',coalesce(c.note,''),'counted_at',c.counted_at,
    'sold_units',(SELECT coalesce(sum(i.quantity),0) FROM public.voss_order_items i JOIN public.voss_orders o ON o.id=i.order_id WHERE i.product_slug=v.product_slug AND i.colour_key=v.colour_key AND o.status='delivered')+
      (SELECT coalesce(sum(f.quantity),0) FROM voss_private.finance_entries f WHERE f.kind='sale' AND f.voided_at IS NULL AND f.product_slug=v.product_slug AND f.colour_key=v.colour_key)) ORDER BY p.article,v.colour_name),'[]')
    INTO inventory_json FROM public.voss_variants v JOIN public.voss_products p ON p.slug=v.product_slug LEFT JOIN voss_private.inventory_counts c USING(product_slug,colour_key);
  SELECT jsonb_build_object('entries',(SELECT coalesce(jsonb_agg(to_jsonb(f)-'request_fingerprint' ORDER BY f.entry_date DESC,f.created_at DESC,f.id),'[]') FROM voss_private.finance_entries f WHERE (p_from IS NULL OR entry_date>=p_from) AND (p_to IS NULL OR entry_date<=p_to)),
    'summary',summary_json,'weekly',weeks_json,'inventory',inventory_json,
    'promotion',(SELECT to_jsonb(p) FROM public.voss_promotions p WHERE code='FIRST30'),
    'categories',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.amount_pkr DESC),'[]') FROM (
      SELECT category,sum(amount_pkr) AS amount_pkr FROM (
        SELECT category,amount_pkr FROM voss_private.finance_entries WHERE kind='expense' AND voided_at IS NULL AND (p_from IS NULL OR entry_date>=p_from) AND (p_to IS NULL OR entry_date<=p_to)
        UNION ALL SELECT extra.category,extra.amount_pkr FROM voss_private.finance_entries f
          CROSS JOIN LATERAL (VALUES('packaging',f.packaging_cost_pkr),('delivery',f.delivery_cost_pkr),('marketing',f.marketing_cost_pkr),('other',f.other_cost_pkr))extra(category,amount_pkr)
          WHERE f.kind='sale' AND f.voided_at IS NULL AND extra.amount_pkr>0 AND (p_from IS NULL OR f.entry_date>=p_from) AND (p_to IS NULL OR f.entry_date<=p_to)
      ) expense_rows GROUP BY category)c),
    'payers',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.amount_pkr DESC),'[]') FROM (
      SELECT payer,sum(amount_pkr) AS amount_pkr FROM (
        SELECT payer,amount_pkr FROM voss_private.finance_entries WHERE kind='expense' AND voided_at IS NULL AND (p_from IS NULL OR entry_date>=p_from) AND (p_to IS NULL OR entry_date<=p_to)
        UNION ALL SELECT cost_payer,packaging_cost_pkr+delivery_cost_pkr+marketing_cost_pkr+other_cost_pkr FROM voss_private.finance_entries
          WHERE kind='sale' AND voided_at IS NULL AND packaging_cost_pkr+delivery_cost_pkr+marketing_cost_pkr+other_cost_pkr>0 AND (p_from IS NULL OR entry_date>=p_from) AND (p_to IS NULL OR entry_date<=p_to)
      ) expense_rows GROUP BY payer)c),
    'import',(SELECT jsonb_build_object('count',count(*),'original_total_pkr',coalesce(sum((source_data->>'gross_amount')::numeric),0),'flagged_dates',count(*) FILTER(WHERE date_flag<>'')) FROM voss_private.finance_entries WHERE source_key LIKE 'inventory-pdf-v1:%'),
    'history',(SELECT coalesce(jsonb_agg(to_jsonb(h)-'actor_id' ORDER BY h.id DESC),'[]') FROM (SELECT * FROM voss_private.finance_audit ORDER BY id DESC LIMIT 100)h),
    'basis',jsonb_build_object('currency','PKR','timezone','Asia/Karachi','week_starts','Monday','stock','Physical count as of counted_at; does not auto-decrement','revenue','Delivered website orders plus distinct offline product sales and customer delivery charges','cash','Recorded collections minus paid expense rows and paid additional order costs on their settlement dates. Bag unit cost is COGS only; purchase cash must be recorded once as a product-purchase expense. Opening cash not included.','profit','Estimate; excludes tax, depreciation and missing unrecorded costs. Product purchases excluded from operating expenses to avoid double-counting COGS. Additional sale costs must not also be entered as separate expense rows.','legacy_dates','Delivery uses business events, then legacy status history, then order creation date. Collections without payment events use order creation date. estimated_order_dates identifies revenue fallback.')) INTO result;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.voss_finance_read(p_from date DEFAULT NULL,p_to date DEFAULT NULL) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT voss_private.finance_read(p_from,p_to) $$;
CREATE OR REPLACE FUNCTION public.voss_finance_save(p_entry jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT voss_private.finance_save(p_entry) $$;
CREATE OR REPLACE FUNCTION public.voss_inventory_save(p_item jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT voss_private.inventory_save(p_item) $$;
REVOKE ALL ON FUNCTION voss_private.finance_read(date,date),voss_private.finance_save(jsonb),voss_private.inventory_save(jsonb),public.voss_finance_read(date,date),public.voss_finance_save(jsonb),public.voss_inventory_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION voss_private.finance_read(date,date),voss_private.finance_save(jsonb),voss_private.inventory_save(jsonb),public.voss_finance_read(date,date),public.voss_finance_save(jsonb),public.voss_inventory_save(jsonb) TO authenticated;
