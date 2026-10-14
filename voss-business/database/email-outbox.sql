-- Service-only claims. No customer details leave the database in email alerts.
ALTER TABLE public.voss_notification_outbox ADD COLUMN IF NOT EXISTS first_attempt_at timestamptz;
ALTER TABLE public.voss_notification_outbox ADD COLUMN IF NOT EXISTS lease_token uuid;
ALTER TABLE public.voss_notification_outbox ADD COLUMN IF NOT EXISTS message_id text;

CREATE OR REPLACE FUNCTION public.voss_email_claim()
RETURNS TABLE(job_id bigint, lease uuid, mail_key uuid, reference text, total_pkr integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Stop uncertain retries before Brevo's 30-minute deduplication window expires.
  UPDATE public.voss_notification_outbox SET state='failed',last_error='Review email delivery before retrying.'
  WHERE state IN ('sending','pending','failed') AND first_attempt_at < now()-interval '20 minutes';
  RETURN QUERY WITH candidates AS (
    SELECT n.id FROM public.voss_notification_outbox n
    WHERE n.state IN ('pending','failed','sending') AND n.next_attempt_at<=now() AND n.attempts<5
      AND (n.first_attempt_at IS NULL OR n.first_attempt_at>now()-interval '20 minutes')
    ORDER BY n.created_at LIMIT 3 FOR UPDATE SKIP LOCKED
  ), claimed AS (
    UPDATE public.voss_notification_outbox n SET state='sending',attempts=attempts+1,
      first_attempt_at=coalesce(first_attempt_at,now()),next_attempt_at=now()+interval '2 minutes',
      lease_token=gen_random_uuid(),last_error=NULL
    FROM candidates c WHERE n.id=c.id RETURNING n.*
  ) SELECT n.id,n.lease_token,n.order_id,o.reference,o.total_pkr
    FROM claimed n JOIN public.voss_orders o ON o.id=n.order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.voss_email_finish(p_id bigint,p_lease uuid,p_sent boolean,p_message text DEFAULT '')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE changed integer;
BEGIN
  UPDATE public.voss_notification_outbox SET state=CASE WHEN p_sent THEN 'sent' ELSE 'failed' END,
    sent_at=CASE WHEN p_sent THEN now() ELSE NULL END,
    message_id=CASE WHEN p_sent THEN left(p_message,200) ELSE NULL END,
    last_error=CASE WHEN p_sent THEN NULL ELSE 'Email service unavailable; retry pending.' END,
    next_attempt_at=now()+interval '2 minutes'
  WHERE id=p_id AND lease_token=p_lease AND state='sending';
  GET DIAGNOSTICS changed=ROW_COUNT;
  RETURN changed=1;
END;
$$;
REVOKE ALL ON FUNCTION public.voss_email_claim() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.voss_email_finish(bigint,uuid,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.voss_email_claim() TO service_role;
GRANT EXECUTE ON FUNCTION public.voss_email_finish(bigint,uuid,boolean,text) TO service_role;
