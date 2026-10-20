-- Phase 1/2 additive migration. Apply AFTER finance.sql. Existing ledger retained.
ALTER TABLE voss_private.finance_entries DROP CONSTRAINT IF EXISTS finance_entries_category_check;
ALTER TABLE voss_private.finance_entries ADD CONSTRAINT finance_entries_category_check CHECK(category IN ('marketing','content','delivery','product','packaging','tools','other'));
CREATE OR REPLACE FUNCTION voss_private.finance_log_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 INSERT INTO voss_private.finance_audit(entity,entity_id,actor_id,old_value,new_value)
 VALUES(TG_TABLE_NAME,coalesce(to_jsonb(NEW)->>'id',to_jsonb(NEW)->>'order_id',(to_jsonb(NEW)->>'product_slug')||':'||(to_jsonb(NEW)->>'colour_key')),auth.uid(),CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) END,to_jsonb(NEW));
 RETURN NEW;
END $$;
ALTER TABLE voss_private.finance_entries
 ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'delivered' CHECK(fulfillment_status IN ('received','confirmed','shipped','delivered','returned','refused','cancelled')),
 ADD COLUMN IF NOT EXISTS cod_fee_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(cod_fee_pkr>=0),
 ADD COLUMN IF NOT EXISTS return_courier_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(return_courier_pkr>=0),
 ADD COLUMN IF NOT EXISTS returns_loss_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(returns_loss_pkr>=0),
 ADD COLUMN IF NOT EXISTS refund_pkr numeric(14,2) NOT NULL DEFAULT 0 CHECK(refund_pkr>=0),
 ADD COLUMN IF NOT EXISTS refund_date date,
 ADD COLUMN IF NOT EXISTS campaign_key text NOT NULL DEFAULT '' CHECK(length(campaign_key)<=150),
 ADD COLUMN IF NOT EXISTS post_id text NOT NULL DEFAULT '' CHECK(length(post_id)<=150),
 ADD COLUMN IF NOT EXISTS customer_key text NOT NULL DEFAULT '' CHECK(length(customer_key)<=150),
 ADD COLUMN IF NOT EXISTS new_customer boolean,
 ADD COLUMN IF NOT EXISTS costs_complete boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS voss_private.order_financials(
 order_id uuid PRIMARY KEY REFERENCES public.voss_orders(id), version integer NOT NULL DEFAULT 1,
 product_cost_pkr numeric(14,2), packaging_cost_pkr numeric(14,2) NOT NULL DEFAULT 0,
 delivery_cost_pkr numeric(14,2) NOT NULL DEFAULT 0, marketing_cost_pkr numeric(14,2) NOT NULL DEFAULT 0,
 other_cost_pkr numeric(14,2) NOT NULL DEFAULT 0,cod_fee_pkr numeric(14,2) NOT NULL DEFAULT 0,
 return_courier_pkr numeric(14,2) NOT NULL DEFAULT 0,returns_loss_pkr numeric(14,2) NOT NULL DEFAULT 0,
 refund_pkr numeric(14,2) NOT NULL DEFAULT 0,refund_date date,costs_complete boolean NOT NULL DEFAULT false,
 costs_paid boolean NOT NULL DEFAULT false,costs_settled_date date,
 campaign_key text NOT NULL DEFAULT '',post_id text NOT NULL DEFAULT '',customer_key text NOT NULL DEFAULT '',new_customer boolean,
 note text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(product_cost_pkr>=0 AND packaging_cost_pkr>=0 AND delivery_cost_pkr>=0 AND marketing_cost_pkr>=0 AND other_cost_pkr>=0 AND cod_fee_pkr>=0 AND return_courier_pkr>=0 AND returns_loss_pkr>=0 AND refund_pkr>=0)
);
CREATE TABLE IF NOT EXISTS voss_private.campaign_daily(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),version integer NOT NULL DEFAULT 1,
 platform text NOT NULL CHECK(platform IN ('meta','google','instagram','other')),
 campaign_key text NOT NULL CHECK(length(campaign_key) BETWEEN 1 AND 150),name text NOT NULL CHECK(length(name) BETWEEN 1 AND 200),
 day date NOT NULL,spend_pkr numeric(14,2) NOT NULL CHECK(spend_pkr>=0),
 impressions bigint CHECK(impressions>=0),reach bigint CHECK(reach>=0),clicks bigint CHECK(clicks>=0),
 source text NOT NULL DEFAULT 'manual' CHECK(source IN ('manual','csv','api')),
 updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(platform,campaign_key,day)
);
ALTER TABLE voss_private.order_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.campaign_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.order_financials,voss_private.campaign_daily FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS order_finance_audit ON voss_private.order_financials;
CREATE TRIGGER order_finance_audit AFTER INSERT OR UPDATE ON voss_private.order_financials FOR EACH ROW EXECUTE FUNCTION voss_private.finance_log_change();
DROP TRIGGER IF EXISTS campaign_audit ON voss_private.campaign_daily;
CREATE TRIGGER campaign_audit AFTER INSERT OR UPDATE ON voss_private.campaign_daily FOR EACH ROW EXECUTE FUNCTION voss_private.finance_log_change();

-- Preserve previous functions as a rollback checkpoint, inaccessible directly.
DO $$ BEGIN
 IF to_regprocedure('voss_private.finance_save_before_upgrade(jsonb)') IS NULL THEN
  ALTER FUNCTION voss_private.finance_save(jsonb) RENAME TO finance_save_before_upgrade;
 END IF;
 IF to_regprocedure('voss_private.finance_read_before_upgrade(date,date)') IS NULL THEN
  ALTER FUNCTION voss_private.finance_read(date,date) RENAME TO finance_read_before_upgrade;
 END IF;
END $$;
REVOKE ALL ON FUNCTION voss_private.finance_save_before_upgrade(jsonb),voss_private.finance_read_before_upgrade(date,date) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION voss_private.finance_save(p_entry jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE saved jsonb; f voss_private.finance_entries%ROWTYPE; previous voss_private.finance_entries%ROWTYPE;
 n numeric; key text; st text; request_id uuid; extra_total numeric; paid_date date;
BEGIN
 PERFORM voss_private.require_owner();
 IF p_entry ? 'void_reason' THEN RETURN voss_private.finance_save_before_upgrade(p_entry); END IF;
 -- Share the base helper's lock order so concurrent retries cannot rewrite a saved sale.
 PERFORM 1 FROM public.voss_promotions WHERE code='FIRST30' FOR UPDATE;
 IF nullif(p_entry->>'id','') IS NULL THEN
  request_id:=nullif(p_entry->>'request_key','')::uuid;
  IF request_id IS NOT NULL THEN
   SELECT * INTO f FROM voss_private.finance_entries WHERE request_key=request_id FOR UPDATE;
   IF FOUND THEN
    IF f.request_fingerprint IS DISTINCT FROM md5((p_entry-'request_key')::text) THEN
     RAISE EXCEPTION 'This sale request was already used with different data. Refresh before saving.' USING ERRCODE='40001';
    END IF;
    -- Return its current state, including later edits or a void, without a write.
    RETURN to_jsonb(f)-'request_fingerprint';
   END IF;
  END IF;
 ELSE
  SELECT * INTO previous FROM voss_private.finance_entries WHERE id=(p_entry->>'id')::uuid FOR UPDATE;
 END IF;
 st:=coalesce(p_entry->>'fulfillment_status','delivered');
 IF st NOT IN ('received','confirmed','shipped','delivered','returned','refused','cancelled') THEN RAISE EXCEPTION 'Choose a valid order status'; END IF;
 FOREACH key IN ARRAY ARRAY['cod_fee_pkr','return_courier_pkr','returns_loss_pkr','refund_pkr'] LOOP
  n:=coalesce((p_entry->>key)::numeric,0);
  IF n<0 OR n>99999999 OR n<>round(n,2) THEN RAISE EXCEPTION 'Costs must be nonnegative PKR with two decimals'; END IF;
 END LOOP;
 IF p_entry->>'kind'='sale' AND p_entry->>'payment_status'='collected' AND st NOT IN ('delivered','returned') THEN RAISE EXCEPTION 'Only delivered orders can have collected cash'; END IF;
 IF coalesce((p_entry->>'refund_pkr')::numeric,0)>0 AND (st<>'returned' OR p_entry->>'payment_status'<>'collected' OR nullif(p_entry->>'refund_date','') IS NULL) THEN RAISE EXCEPTION 'A refund needs a returned, previously collected order and refund date'; END IF;
 IF coalesce((p_entry->>'refund_pkr')::numeric,0)>coalesce((p_entry->>'amount_pkr')::numeric,0)+coalesce((p_entry->>'delivery_charged_pkr')::numeric,0) THEN RAISE EXCEPTION 'Refund exceeds collected amount'; END IF;
 IF length(coalesce(p_entry->>'campaign_key',''))>150 OR length(coalesce(p_entry->>'post_id',''))>150 OR length(coalesce(p_entry->>'customer_key',''))>150 THEN RAISE EXCEPTION 'Reference too long'; END IF;
 -- The preserved helper predates COD/return fees, so calculate their paid date here.
 extra_total:=coalesce(nullif(p_entry->>'packaging_cost_pkr','')::numeric,0)+coalesce(nullif(p_entry->>'delivery_cost_pkr','')::numeric,0)
  +coalesce(nullif(p_entry->>'marketing_cost_pkr','')::numeric,0)+coalesce(nullif(p_entry->>'other_cost_pkr','')::numeric,0)
  +coalesce((p_entry->>'cod_fee_pkr')::numeric,0)+coalesce((p_entry->>'return_courier_pkr')::numeric,0)+coalesce((p_entry->>'returns_loss_pkr')::numeric,0);
 IF p_entry->>'kind'='sale' AND extra_total>0 AND coalesce((p_entry->>'costs_paid')::boolean,true) THEN
  paid_date:=coalesce(nullif(p_entry->>'costs_settled_date','')::date,
   CASE WHEN previous.kind='sale' AND previous.costs_paid AND previous.costs_settled_date IS NOT NULL THEN previous.costs_settled_date
    WHEN previous.id IS NOT NULL AND NOT previous.costs_paid THEN (now() AT TIME ZONE 'Asia/Karachi')::date
    ELSE (p_entry->>'entry_date')::date END);
 END IF;
 saved:=voss_private.finance_save_before_upgrade(p_entry);
 SELECT * INTO f FROM voss_private.finance_entries WHERE id=(saved->>'id')::uuid;
 IF p_entry->>'kind'='sale' THEN
  UPDATE voss_private.finance_entries SET fulfillment_status=st,costs_settled_date=paid_date,
   cod_fee_pkr=coalesce((p_entry->>'cod_fee_pkr')::numeric,0),return_courier_pkr=coalesce((p_entry->>'return_courier_pkr')::numeric,0),
   returns_loss_pkr=coalesce((p_entry->>'returns_loss_pkr')::numeric,0),refund_pkr=coalesce((p_entry->>'refund_pkr')::numeric,0),refund_date=nullif(p_entry->>'refund_date','')::date,
   campaign_key=trim(coalesce(p_entry->>'campaign_key','')),post_id=trim(coalesce(p_entry->>'post_id','')),customer_key=trim(coalesce(p_entry->>'customer_key','')),
   new_customer=(p_entry->>'new_customer')::boolean,costs_complete=coalesce((p_entry->>'costs_complete')::boolean,false)
  WHERE id=f.id AND (fulfillment_status,costs_settled_date,cod_fee_pkr,return_courier_pkr,returns_loss_pkr,refund_pkr,refund_date,campaign_key,post_id,customer_key,new_customer,costs_complete)
  IS DISTINCT FROM (st,paid_date,coalesce((p_entry->>'cod_fee_pkr')::numeric,0),coalesce((p_entry->>'return_courier_pkr')::numeric,0),coalesce((p_entry->>'returns_loss_pkr')::numeric,0),coalesce((p_entry->>'refund_pkr')::numeric,0),nullif(p_entry->>'refund_date','')::date,trim(coalesce(p_entry->>'campaign_key','')),trim(coalesce(p_entry->>'post_id','')),trim(coalesce(p_entry->>'customer_key','')),(p_entry->>'new_customer')::boolean,coalesce((p_entry->>'costs_complete')::boolean,false));
 END IF;
 SELECT * INTO f FROM voss_private.finance_entries WHERE id=f.id;
 RETURN to_jsonb(f)-'request_fingerprint';
END $$;

-- Normalized orders; these are private views, never exposed via REST tables.
CREATE OR REPLACE VIEW voss_private.finance_sales AS
 SELECT f.id::text AS id,'offline'::text AS source,f.description AS reference,f.entry_date AS order_date,
 f.fulfillment_status AS status,f.payment_status,f.settled_date AS collection_date,f.quantity,
 coalesce(f.product_slug,'unlinked') AS product_slug,coalesce(p.name,f.description) AS product_name,
 f.amount_pkr AS subtotal,f.delivery_charged_pkr AS shipping,f.cogs_pkr AS product_cost,
 f.packaging_cost_pkr AS packaging,f.delivery_cost_pkr AS courier,f.marketing_cost_pkr AS marketing,f.other_cost_pkr AS other_cost,
 f.cod_fee_pkr AS cod_fee,f.return_courier_pkr AS return_courier,f.returns_loss_pkr AS returns_loss,
 f.refund_pkr AS refund,f.refund_date,f.costs_complete,f.costs_paid,f.costs_settled_date,f.campaign_key,f.post_id,f.customer_key,f.new_customer
 FROM voss_private.finance_entries f LEFT JOIN public.voss_products p ON p.slug=f.product_slug WHERE f.kind='sale' AND f.voided_at IS NULL
 UNION ALL
 SELECT o.id::text,'website',o.reference,(o.created_at AT TIME ZONE 'Asia/Karachi')::date,o.status,o.payment_status,
 (coalesce((SELECT min(e.created_at) FROM public.voss_business_events e WHERE e.order_id=o.id AND e.action='payment' AND e.new_value='collected'),o.created_at) AT TIME ZONE 'Asia/Karachi')::date,
 (SELECT coalesce(sum(i.quantity),0)::integer FROM public.voss_order_items i WHERE i.order_id=o.id),
 CASE WHEN (SELECT count(DISTINCT i.product_slug) FROM public.voss_order_items i WHERE i.order_id=o.id)=1 THEN (SELECT min(i.product_slug) FROM public.voss_order_items i WHERE i.order_id=o.id) ELSE 'mixed-order' END,
 (SELECT string_agg(DISTINCT i.name,', ' ORDER BY i.name) FROM public.voss_order_items i WHERE i.order_id=o.id),
 o.subtotal_pkr,o.delivery_pkr,coalesce(c.product_cost_pkr,CASE WHEN NOT EXISTS(SELECT 1 FROM public.voss_order_items i LEFT JOIN voss_private.order_cost_snapshots s USING(order_id,product_slug,colour_key) WHERE i.order_id=o.id AND s.unit_cost_pkr IS NULL) THEN (SELECT sum(s.quantity*s.unit_cost_pkr) FROM voss_private.order_cost_snapshots s WHERE s.order_id=o.id) END),
 coalesce(c.packaging_cost_pkr,0),coalesce(c.delivery_cost_pkr,0),coalesce(c.marketing_cost_pkr,0),coalesce(c.other_cost_pkr,0),coalesce(c.cod_fee_pkr,0),coalesce(c.return_courier_pkr,0),coalesce(c.returns_loss_pkr,0),coalesce(c.refund_pkr,0),c.refund_date,coalesce(c.costs_complete,false),coalesce(c.costs_paid,false),c.costs_settled_date,coalesce(c.campaign_key,''),coalesce(c.post_id,''),coalesce(c.customer_key,''),c.new_customer
 FROM public.voss_orders o LEFT JOIN voss_private.order_financials c ON c.order_id=o.id;
REVOKE ALL ON voss_private.finance_sales FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION voss_private.finance_report(p_from date,p_to date) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 WITH sales AS (SELECT s.*,
  CASE WHEN status='delivered' AND payment_status='collected' THEN subtotal+shipping ELSE 0 END AS revenue,
  CASE WHEN status='delivered' AND payment_status='collected' THEN coalesce(product_cost,0) ELSE 0 END AS cogs,
  packaging+courier+marketing+other_cost+cod_fee+return_courier+returns_loss AS additional,
  CASE WHEN status='delivered' AND payment_status='collected' THEN collection_date ELSE order_date END AS report_date
  FROM voss_private.finance_sales s), selected AS (SELECT * FROM sales WHERE (p_from IS NULL OR report_date>=p_from) AND (p_to IS NULL OR report_date<=p_to)),
 expenses AS (SELECT * FROM voss_private.finance_entries WHERE kind='expense' AND voided_at IS NULL AND (p_from IS NULL OR entry_date>=p_from) AND (p_to IS NULL OR entry_date<=p_to)),
 ads AS (SELECT * FROM voss_private.campaign_daily WHERE (p_from IS NULL OR day>=p_from) AND (p_to IS NULL OR day<=p_to)),
 totals AS (SELECT coalesce(sum(revenue),0) revenue,coalesce(sum(cogs),0) cogs,coalesce(sum(additional),0) additional,
  coalesce(sum(quantity) FILTER(WHERE status='delivered' AND payment_status='collected'),0) bags,
  count(*) FILTER(WHERE status='delivered' AND payment_status='collected') sold_orders,
  count(*) FILTER(WHERE status NOT IN ('received','confirmed','cancelled') AND (NOT costs_complete OR (status='delivered' AND product_cost IS NULL))) incomplete,
  coalesce(sum(subtotal+shipping) FILTER(WHERE payment_status='pending' AND status NOT IN ('cancelled','returned','refused')),0) pending,
  coalesce(sum(subtotal+shipping-refund) FILTER(WHERE status='returned' AND payment_status='collected'),0) refund_due
  FROM selected),
 expenses_total AS (SELECT coalesce(sum(amount_pkr),0) spent,coalesce(sum(amount_pkr) FILTER(WHERE category<>'product'),0) operating,coalesce(sum(amount_pkr) FILTER(WHERE category='product'),0) purchases FROM expenses),
 ads_total AS (SELECT coalesce(sum(spend_pkr),0) spend FROM ads),
 calc AS (SELECT t.*,e.spent+additional+a.spend AS total_spent,e.operating,e.purchases,a.spend AS ads_spend,
  CASE WHEN incomplete=0 THEN revenue-cogs-additional-e.operating-a.spend END AS profit FROM totals t CROSS JOIN expenses_total e CROSS JOIN ads_total a),
 bags AS (SELECT product_slug,product_name,sum(quantity) FILTER(WHERE status='delivered' AND payment_status='collected') AS bags_sold,sum(revenue) revenue,round(sum(subtotal) FILTER(WHERE revenue>0)/nullif(sum(quantity) FILTER(WHERE revenue>0),0),2) price,sum(cogs) product_cost,sum(packaging) packaging,sum(courier) courier,sum(cod_fee) cod_fee,sum(marketing+coalesce((SELECT sum(spend_pkr) FROM ads WHERE ads.campaign_key=selected.campaign_key),0)*quantity/nullif((SELECT sum(s2.quantity) FROM selected s2 WHERE s2.campaign_key=selected.campaign_key),0)) marketing,sum(return_courier+returns_loss) returns_loss,sum(other_cost) other_cost,
  bool_and(costs_complete AND (status<>'delivered' OR product_cost IS NOT NULL)) complete,
  CASE WHEN bool_and(costs_complete AND (status<>'delivered' OR product_cost IS NOT NULL)) THEN sum(revenue-cogs-additional-coalesce((SELECT sum(spend_pkr) FROM ads WHERE ads.campaign_key=selected.campaign_key),0)*quantity/nullif((SELECT sum(s2.quantity) FROM selected s2 WHERE s2.campaign_key=selected.campaign_key),0)) END contribution
  FROM selected GROUP BY product_slug,product_name),
 campaigns AS (SELECT campaign_key,max(name) name,sum(spend_pkr) spend,sum(impressions) impressions,sum(reach) reach,sum(clicks) clicks FROM ads GROUP BY campaign_key),
 campaign_results AS (SELECT c.*,coalesce((SELECT sum(revenue) FROM selected s WHERE s.campaign_key=c.campaign_key),0) revenue,
  (SELECT count(DISTINCT customer_key) FROM selected s WHERE s.campaign_key=c.campaign_key AND s.new_customer AND s.customer_key<>'' AND s.revenue>0) new_customers,
  (SELECT count(*) FROM selected s WHERE s.campaign_key=c.campaign_key AND s.revenue>0 AND (s.new_customer IS NULL OR s.customer_key='')) unknown_customers
  FROM campaigns c)
 SELECT jsonb_build_object('summary',(SELECT to_jsonb(c)||jsonb_build_object('margin',CASE WHEN revenue>0 THEN round(profit/revenue*100,2) END,'recovered',revenue,'remaining',greatest(total_spent-revenue,0)) FROM calc c),
  'bags',(SELECT coalesce(jsonb_agg(to_jsonb(b)||jsonb_build_object('margin',CASE WHEN revenue>0 THEN round(contribution/revenue*100,2) END) ORDER BY contribution ASC NULLS FIRST),'[]') FROM bags b),
  'campaigns',(SELECT coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object('profit',CASE WHEN NOT EXISTS(SELECT 1 FROM selected s WHERE s.campaign_key=c.campaign_key AND (NOT s.costs_complete OR (s.revenue>0 AND s.product_cost IS NULL))) THEN coalesce((SELECT sum(revenue-cogs-additional) FROM selected s WHERE s.campaign_key=c.campaign_key),0)-c.spend END,'roas',CASE WHEN spend>0 THEN round(revenue/spend,3) END,'cac',CASE WHEN unknown_customers=0 AND new_customers>0 THEN round(spend/new_customers,2) END,'cpc',CASE WHEN clicks>0 THEN round(spend/clicks,2) END,'cpm',CASE WHEN impressions>0 THEN round(spend/impressions*1000,2) END)),'[]') FROM campaign_results c),
  'cash',jsonb_build_object('collected',coalesce((SELECT sum(subtotal+shipping) FROM sales WHERE payment_status='collected' AND (p_from IS NULL OR collection_date>=p_from) AND (p_to IS NULL OR collection_date<=p_to)),0),'refunded',coalesce((SELECT sum(refund) FROM sales WHERE (p_from IS NULL OR refund_date>=p_from) AND (p_to IS NULL OR refund_date<=p_to)),0),'spent',coalesce((SELECT sum(amount_pkr) FROM voss_private.finance_entries WHERE kind='expense' AND voided_at IS NULL AND payment_status='paid' AND (p_from IS NULL OR settled_date>=p_from) AND (p_to IS NULL OR settled_date<=p_to)),0)+coalesce((SELECT sum(additional) FROM sales WHERE costs_paid AND (p_from IS NULL OR costs_settled_date>=p_from) AND (p_to IS NULL OR costs_settled_date<=p_to)),0)),
  'orders',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY report_date DESC),'[]') FROM selected s),
  'campaign_entries',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY day DESC),'[]') FROM ads a)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION voss_private.finance_report(date,date) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION voss_private.finance_read(p_from date,p_to date) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r jsonb; a jsonb; s jsonb; w jsonb;
BEGIN
 PERFORM voss_private.require_owner();
 r:=voss_private.finance_read_before_upgrade(p_from,p_to);
 a:=voss_private.finance_report(p_from,p_to);s:=a->'summary';
 r:=jsonb_set(r,'{summary}',(r->'summary')||jsonb_build_object('revenue_pkr',s->'revenue','known_cogs_pkr',s->'cogs','expenses_pkr',s->'total_spent','operating_expenses_pkr',((s->>'operating')::numeric+(s->>'additional')::numeric+(s->>'ads_spend')::numeric),'product_purchases_pkr',s->'purchases','net_profit_estimate_pkr',s->'profit','gross_profit_estimate_pkr',CASE WHEN (s->>'incomplete')::integer=0 THEN (s->>'revenue')::numeric-(s->>'cogs')::numeric END,'missing_cost_sales',s->'incomplete','pending_cod_pkr',s->'pending','sale_count',s->'sold_orders','website_revenue_pkr',(SELECT coalesce(sum((j->>'revenue')::numeric),0) FROM jsonb_array_elements(a->'orders') j WHERE j->>'source'='website'),'manual_revenue_pkr',(SELECT coalesce(sum((j->>'revenue')::numeric),0) FROM jsonb_array_elements(a->'orders') j WHERE j->>'source'='offline'),'cash_collected_pkr',(a->'cash'->>'collected')::numeric-(a->'cash'->>'refunded')::numeric,'cash_spent_pkr',a->'cash'->'spent','cash_balance_pkr',(a->'cash'->>'collected')::numeric-(a->'cash'->>'refunded')::numeric-(a->'cash'->>'spent')::numeric));
 -- Weekly reports use precisely the same accounting engine as the summary.
 SELECT coalesce(jsonb_agg(jsonb_build_object('week_start',d,'revenue_pkr',x->'summary'->'revenue','expenses_pkr',x->'summary'->'total_spent','net_profit_estimate_pkr',x->'summary'->'profit','cash_balance_pkr',(x->'cash'->>'collected')::numeric-(x->'cash'->>'refunded')::numeric-(x->'cash'->>'spent')::numeric) ORDER BY d DESC),'[]') INTO w
 FROM (SELECT DISTINCT date_trunc('week',dt)::date d FROM (
  SELECT entry_date dt FROM voss_private.finance_entries WHERE voided_at IS NULL
  UNION SELECT settled_date FROM voss_private.finance_entries WHERE kind='expense' AND voided_at IS NULL AND payment_status='paid'
  UNION SELECT collection_date FROM voss_private.finance_sales UNION SELECT order_date FROM voss_private.finance_sales
  UNION SELECT costs_settled_date FROM voss_private.finance_sales WHERE costs_paid
  UNION SELECT refund_date FROM voss_private.finance_sales WHERE refund>0
  UNION SELECT day FROM voss_private.campaign_daily) dates WHERE dt IS NOT NULL AND (p_from IS NULL OR dt>=p_from) AND (p_to IS NULL OR dt<=p_to)) weeks
 CROSS JOIN LATERAL (SELECT voss_private.finance_report(greatest(d,p_from),least(d+6,p_to)) x) calculations;
 r:=jsonb_set(r,'{weekly}',w);
 -- Reconcile category totals with the same selected sales/campaigns as total_spent.
 r:=jsonb_set(r,'{categories}',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.amount_pkr DESC),'[]') FROM (
  SELECT category,sum(amount_pkr) AS amount_pkr FROM (
   SELECT category,amount_pkr FROM voss_private.finance_entries WHERE kind='expense' AND voided_at IS NULL
    AND (p_from IS NULL OR entry_date>=p_from) AND (p_to IS NULL OR entry_date<=p_to)
   UNION ALL SELECT costs.category,costs.amount_pkr FROM jsonb_array_elements(a->'orders') sale
    CROSS JOIN LATERAL (VALUES
     ('packaging',(sale->>'packaging')::numeric),
     ('delivery',(sale->>'courier')::numeric+(sale->>'cod_fee')::numeric+(sale->>'return_courier')::numeric),
     ('marketing',(sale->>'marketing')::numeric),
     ('other',(sale->>'other_cost')::numeric+(sale->>'returns_loss')::numeric)
    ) costs(category,amount_pkr) WHERE costs.amount_pkr>0
   UNION ALL SELECT 'marketing',(campaign->>'spend_pkr')::numeric FROM jsonb_array_elements(a->'campaign_entries') campaign
  ) categorized GROUP BY category HAVING sum(amount_pkr)>0)c));
 r:=jsonb_set(r,'{history}',(SELECT coalesce(jsonb_agg(to_jsonb(h) ORDER BY h.id DESC),'[]') FROM (SELECT a.id,a.entity,a.entity_id,a.old_value,a.new_value,a.created_at,coalesce(u.email,'System / import') AS actor FROM voss_private.finance_audit a LEFT JOIN auth.users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 100) h));
 RETURN r||jsonb_build_object('analysis',a,'basis',(r->'basis')||jsonb_build_object('revenue','Only delivered orders with collected cash. Booking date is collection date. Returned/refused orders earn no revenue.','profit','Collected sales less sold product cost and recorded costs. Incomplete until cost review is confirmed. Bag contribution includes campaign spend allocated by linked order quantity in the selected period. General overhead reduces only total net profit.','cash','Cash received is separate from revenue; returned collections need explicit refund records. Campaign spend is excluded from cash spent because no payment date is recorded.'));
END $$;
GRANT EXECUTE ON FUNCTION voss_private.finance_read(date,date),voss_private.finance_save(jsonb) TO authenticated;
REVOKE ALL ON FUNCTION voss_private.finance_read(date,date),voss_private.finance_save(jsonb) FROM PUBLIC,anon;

CREATE OR REPLACE FUNCTION public.voss_campaign_save(p_row jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_row voss_private.campaign_daily%ROWTYPE; saved voss_private.campaign_daily%ROWTYPE; n numeric;
BEGIN
 PERFORM voss_private.require_owner();
 n:=(p_row->>'spend_pkr')::numeric;
 IF n IS NULL OR n<0 OR n>99999999 OR n<>round(n,2) THEN RAISE EXCEPTION 'Enter valid campaign spend in PKR'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('voss-campaign:'||(p_row->>'platform')||':'||(p_row->>'campaign_key')||':'||(p_row->>'day'),0));
 SELECT * INTO current_row FROM voss_private.campaign_daily WHERE platform=p_row->>'platform' AND campaign_key=p_row->>'campaign_key' AND day=(p_row->>'day')::date FOR UPDATE;
 IF coalesce((p_row->>'version')::integer,0)<>coalesce(current_row.version,0) THEN RAISE EXCEPTION 'Campaign row changed or already exists. Refresh before saving.' USING ERRCODE='40001'; END IF;
 INSERT INTO voss_private.campaign_daily(platform,campaign_key,name,day,spend_pkr,impressions,reach,clicks,source)
 VALUES(p_row->>'platform',p_row->>'campaign_key',p_row->>'name',(p_row->>'day')::date,n,nullif(p_row->>'impressions','')::bigint,nullif(p_row->>'reach','')::bigint,nullif(p_row->>'clicks','')::bigint,CASE WHEN p_row->>'source'='csv' THEN 'csv' ELSE 'manual' END)
 ON CONFLICT(platform,campaign_key,day) DO UPDATE SET name=excluded.name,spend_pkr=excluded.spend_pkr,impressions=excluded.impressions,reach=excluded.reach,clicks=excluded.clicks,source=excluded.source,version=campaign_daily.version+1,updated_at=now() RETURNING * INTO saved;
 RETURN to_jsonb(saved);
END $$;
REVOKE ALL ON FUNCTION public.voss_campaign_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.voss_campaign_save(jsonb) TO authenticated;
