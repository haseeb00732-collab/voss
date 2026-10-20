-- Synthetic data only. No business records or real payer names.
INSERT INTO voss_private.finance_entries(kind,entry_date,category,description,amount_pkr,payer,payment_status,settled_date,source_key,source_data,date_flag)
SELECT 'expense',d::date,category,description,amount,payer,'paid',d::date,'inventory-pdf-v1:'||lpad(n::text,2,'0'),
  jsonb_build_object('file','synthetic-fixture.pdf','row',n,'original_row','Synthetic test row','gross_amount',amount),
  CASE WHEN n=3 THEN 'Source date needs confirmation; preserved unchanged.' ELSE '' END
FROM (VALUES
  (1,'2026-08-20','tools','Synthetic service',100.10,'Test payer A'),
  (2,'2026-09-10','product','Synthetic purchase',200.20,'Test payer B'),
  (3,'2030-01-15','packaging','Synthetic packaging',50.00,'Test payer A')
) AS imported(n,d,category,description,amount,payer)
ON CONFLICT(source_key) DO NOTHING;
