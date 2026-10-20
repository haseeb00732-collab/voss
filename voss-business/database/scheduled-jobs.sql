-- Narrow, secret-authenticated server jobs. No service-role key is exposed.
CREATE TABLE IF NOT EXISTS voss_private.job_credentials(name text PRIMARY KEY,secret_hash text NOT NULL);
CREATE TABLE IF NOT EXISTS voss_private.job_status(name text PRIMARY KEY,state text NOT NULL,checked_at timestamptz NOT NULL DEFAULT now(),message text NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS voss_private.social_cache(platform text PRIMARY KEY,payload jsonb NOT NULL,checked_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE voss_private.job_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.job_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.social_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.job_credentials,voss_private.job_status,voss_private.social_cache FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.voss_job(p_secret text,p_action text,p_data jsonb DEFAULT '{}') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t record;result jsonb:='{}';rows jsonb;row jsonb;n numeric;conflicts integer:=0;
BEGIN
 IF length(coalesce(p_secret,''))<64 OR NOT EXISTS(SELECT 1 FROM voss_private.job_credentials WHERE name='worker' AND secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex')) THEN RAISE EXCEPTION 'Job authorization required' USING ERRCODE='42501'; END IF;
 IF p_action='backup' THEN
  FOR t IN SELECT table_schema,table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND ((table_schema='public' AND table_name LIKE 'voss_%') OR (table_schema='voss_private' AND table_name<>'job_credentials')) ORDER BY table_schema,table_name LOOP
   EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]'') FROM %I.%I t',t.table_schema,t.table_name) INTO rows;
   result:=result||jsonb_build_object(t.table_schema||'.'||t.table_name,rows);
  END LOOP;
  RETURN jsonb_build_object('format',1,'created_at',now(),'tables',result,'functions',(SELECT jsonb_agg(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='voss_private' OR (n.nspname='public' AND p.proname LIKE 'voss_%')));
 ELSIF p_action='weekly' THEN
  PERFORM voss_private.generate_weekly_report();
  INSERT INTO voss_private.job_status VALUES('weekly','ok',now(),'PDF snapshot generated; email sender not configured.') ON CONFLICT(name) DO UPDATE SET state=excluded.state,checked_at=now(),message=excluded.message;
  RETURN jsonb_build_object('ok',true);
 ELSIF p_action='status' THEN
  IF p_data->>'name' NOT IN ('backup','social','weekly') OR p_data->>'state' NOT IN ('ok','error','disconnected','reconnect') THEN RAISE EXCEPTION 'Invalid job status'; END IF;
  INSERT INTO voss_private.job_status VALUES(p_data->>'name',p_data->>'state',now(),left(coalesce(p_data->>'message',''),300)) ON CONFLICT(name) DO UPDATE SET state=excluded.state,checked_at=now(),message=excluded.message;
  RETURN jsonb_build_object('ok',true);
 ELSIF p_action='social' THEN
  IF octet_length(p_data::text)>500000 OR jsonb_typeof(p_data->'campaigns')<>'array' OR jsonb_array_length(p_data->'campaigns')>100 THEN RAISE EXCEPTION 'Invalid social batch'; END IF;
  INSERT INTO voss_private.social_cache VALUES('meta',p_data-'campaigns',now()) ON CONFLICT(platform) DO UPDATE SET payload=excluded.payload,checked_at=now();
  FOR row IN SELECT * FROM jsonb_array_elements(p_data->'campaigns') LOOP
   n:=(row->>'spend_pkr')::numeric;
   IF n IS NULL OR n<0 OR n>99999999 OR n<>round(n,2) OR row->>'campaign_key' NOT LIKE 'meta:%' OR length(row->>'campaign_key')>150 THEN RAISE EXCEPTION 'Invalid Meta spend'; END IF;
   -- Never silently overwrite an owner's manually entered campaign day.
   IF EXISTS(SELECT 1 FROM voss_private.campaign_daily WHERE platform='meta' AND campaign_key=row->>'campaign_key' AND day=(row->>'day')::date AND source<>'api') THEN conflicts:=conflicts+1;CONTINUE;END IF;
   INSERT INTO voss_private.campaign_daily(platform,campaign_key,name,day,spend_pkr,impressions,clicks,source)
   VALUES('meta',row->>'campaign_key',left(row->>'name',200),(row->>'day')::date,n,(row->>'impressions')::bigint,(row->>'clicks')::bigint,'api')
   ON CONFLICT(platform,campaign_key,day) DO UPDATE SET name=excluded.name,spend_pkr=excluded.spend_pkr,impressions=excluded.impressions,clicks=excluded.clicks,version=campaign_daily.version+1,updated_at=now()
   WHERE (campaign_daily.spend_pkr,campaign_daily.impressions,campaign_daily.clicks) IS DISTINCT FROM (excluded.spend_pkr,excluded.impressions,excluded.clicks);
  END LOOP;
  INSERT INTO voss_private.job_status VALUES('social',coalesce(p_data->>'state','ok'),now(),CASE WHEN conflicts>0 THEN conflicts||' manual campaign days preserved; reconcile before relying on attribution.' ELSE left(coalesce(p_data->>'notice','Refreshed cached metrics.'),300) END) ON CONFLICT(name) DO UPDATE SET state=excluded.state,checked_at=now(),message=excluded.message;
  RETURN jsonb_build_object('ok',true,'manual_conflicts',conflicts);
 END IF;
 RAISE EXCEPTION 'Unsupported job';
END $$;
REVOKE ALL ON FUNCTION public.voss_job(text,text,jsonb) FROM PUBLIC,authenticated;
GRANT EXECUTE ON FUNCTION public.voss_job(text,text,jsonb) TO anon;

CREATE OR REPLACE FUNCTION public.voss_system_status() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM voss_private.require_member();
 RETURN jsonb_build_object('jobs',(SELECT coalesce(jsonb_agg(to_jsonb(j)),'[]') FROM voss_private.job_status j),'social',(SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]') FROM voss_private.social_cache c));
END $$;
REVOKE ALL ON FUNCTION public.voss_system_status() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.voss_system_status() TO authenticated;
