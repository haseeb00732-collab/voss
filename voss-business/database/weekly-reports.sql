-- Deterministic reports: no AI, no external API needed to generate the report.
CREATE TABLE IF NOT EXISTS voss_private.weekly_reports(
 week_start date PRIMARY KEY,created_at timestamptz NOT NULL DEFAULT now(),report jsonb NOT NULL,pdf_base64 text NOT NULL,
 email_state text NOT NULL DEFAULT 'sender_not_configured'
);
ALTER TABLE voss_private.weekly_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.weekly_reports FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION voss_private.report_pdf(lines text[]) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE stream text:='BT /F1 12 Tf 48 790 Td 18 TL ';line text;doc text:='%PDF-1.4'||chr(10);objects text[];offsets integer[]:=ARRAY[0];i integer;x integer;
BEGIN
 FOREACH line IN ARRAY lines LOOP
  line:=regexp_replace(line,'[^ -~]','','g');line:=replace(replace(replace(line,E'\\',E'\\\\'),'(',E'\\('),')',E'\\)');
  stream:=stream||'('||line||') Tj T* ';
 END LOOP;
 stream:=stream||'ET';
 objects:=ARRAY['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '||octet_length(stream)||' >>'||chr(10)||'stream'||chr(10)||stream||chr(10)||'endstream'];
 FOR i IN 1..5 LOOP offsets:=array_append(offsets,octet_length(doc));doc:=doc||i||' 0 obj'||chr(10)||objects[i]||chr(10)||'endobj'||chr(10);END LOOP;
 x:=octet_length(doc);doc:=doc||'xref'||chr(10)||'0 6'||chr(10)||'0000000000 65535 f '||chr(10);
 FOR i IN 2..6 LOOP doc:=doc||lpad(offsets[i]::text,10,'0')||' 00000 n '||chr(10);END LOOP;
 doc:=doc||'trailer << /Size 6 /Root 1 0 R >>'||chr(10)||'startxref'||chr(10)||x||chr(10)||'%%EOF';
 RETURN encode(convert_to(doc,'UTF8'),'base64');
END $$;
CREATE OR REPLACE FUNCTION voss_private.generate_weekly_report() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE start_day date:=(date_trunc('week',now() AT TIME ZONE 'Asia/Karachi')::date-7);r jsonb;previous jsonb;s jsonb;p jsonb;lines text[];best text;worst text;campaign text;
BEGIN
 IF EXISTS(SELECT 1 FROM voss_private.weekly_reports WHERE week_start=start_day) THEN RETURN; END IF;
 r:=voss_private.finance_report(start_day,start_day+6);previous:=voss_private.finance_report(start_day-7,start_day-1);s:=r->'summary';p:=previous->'summary';
 SELECT b->>'product_name' INTO best FROM jsonb_array_elements(r->'bags') b WHERE b->>'contribution' IS NOT NULL ORDER BY (b->>'contribution')::numeric DESC LIMIT 1;
 SELECT b->>'product_name' INTO worst FROM jsonb_array_elements(r->'bags') b WHERE b->>'contribution' IS NOT NULL ORDER BY (b->>'contribution')::numeric ASC LIMIT 1;
 SELECT b->>'name' INTO campaign FROM jsonb_array_elements(r->'campaigns') b WHERE b->>'profit' IS NOT NULL ORDER BY (b->>'profit')::numeric DESC LIMIT 1;
 lines:=ARRAY['VOSS BUSINESS - WEEKLY REPORT',start_day::text||' to '||(start_day+6)::text||' | PKR | Asia/Karachi','',
  'Collected '||(s->>'revenue')||' from '||(s->>'bags')||' sold bags; profit '||coalesce(s->>'profit','incomplete - review costs')||'.','',
  'THIS WEEK / PREVIOUS WEEK',
  'Spent: '||(s->>'total_spent')||' / '||(p->>'total_spent'),
  'Collected sales: '||(s->>'revenue')||' / '||(p->>'revenue'),
  'Net profit: '||coalesce(s->>'profit','Incomplete')||' / '||coalesce(p->>'profit','Incomplete'),
  'Bags sold: '||(s->>'bags')||' / '||(p->>'bags'),
  'Pending COD on orders in period: '||(s->>'pending'),
  'Best bag: '||coalesce(best,'No costed sales'), 'Lowest contribution bag: '||coalesce(worst,'No costed sales'),
  'Best attributed campaign: '||coalesce(campaign,'No attributed campaign data'),
  'Best social post: unavailable until social metrics are connected.','',
  'RISKS TO CHECK',
  '1. '||(s->>'incomplete')||' orders have incomplete cost review.',
  '2. Pending COD: PKR '||(s->>'pending')||'; do not treat it as collected revenue.',
  '3. Returned cash awaiting recorded refund: PKR '||(s->>'refund_due')||'.','',
  'NEXT ACTIONS',
  '1. Reconcile courier collections with delivered orders.',
  '2. Check missing costs and any returned/refused courier charges.',
  '3. Link known campaigns and review spend before increasing budgets.','',
  'Revenue requires Delivered AND Collected. Missing costs keep profit incomplete.',
  'Product purchases are not deducted twice as sold product cost.',
  'This snapshot excludes unrecorded activity. Generated automatically without AI.'];
 INSERT INTO voss_private.weekly_reports(week_start,report,pdf_base64)
 VALUES(start_day,jsonb_build_object('current',r,'previous',previous,'lines',to_jsonb(lines)),voss_private.report_pdf(lines)) ON CONFLICT DO NOTHING;
END $$;
CREATE OR REPLACE FUNCTION public.voss_weekly_reports() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM voss_private.require_member();
 RETURN (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY week_start DESC),'[]') FROM (SELECT * FROM voss_private.weekly_reports ORDER BY week_start DESC LIMIT 26)r);
END $$;
REVOKE ALL ON FUNCTION voss_private.report_pdf(text[]),voss_private.generate_weekly_report(),public.voss_weekly_reports() FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION voss_private.report_pdf(text[]),voss_private.generate_weekly_report() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.voss_weekly_reports() TO authenticated;
-- Schedule separately after checking pg_cron availability. 0 4 * * 1 = Monday 09:00 Pakistan.
