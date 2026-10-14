-- Registration never grants order access. Only the designated technical admin can approve staff.
ALTER TABLE voss_private.business_owners ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','technical'));
CREATE TABLE IF NOT EXISTS voss_private.business_access_requests (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id), email text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS voss_private.business_bootstrap (
  email text PRIMARY KEY, claimed_by uuid REFERENCES auth.users(id)
);
INSERT INTO voss_private.business_bootstrap(email) VALUES('haseeb00732@gmail.com') ON CONFLICT DO NOTHING;
ALTER TABLE voss_private.business_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE voss_private.business_bootstrap ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON voss_private.business_access_requests,voss_private.business_bootstrap FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION voss_private.access_status() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u auth.users%ROWTYPE; member_role text;
BEGIN
  SELECT * INTO u FROM auth.users WHERE id=auth.uid();
  IF u.id IS NULL OR u.email_confirmed_at IS NULL THEN RAISE EXCEPTION 'Verify your email before requesting access' USING ERRCODE='42501'; END IF;
  INSERT INTO voss_private.business_access_requests(user_id,email) VALUES(u.id,lower(u.email))
    ON CONFLICT(user_id) DO UPDATE SET email=EXCLUDED.email;
  -- Single use, verified-email bootstrap; never reactivates a revoked account.
  UPDATE voss_private.business_bootstrap SET claimed_by=u.id WHERE email=lower(u.email) AND claimed_by IS NULL;
  IF FOUND THEN INSERT INTO voss_private.business_owners(user_id,role) VALUES(u.id,'technical') ON CONFLICT DO NOTHING; END IF;
  SELECT role INTO member_role FROM voss_private.business_owners WHERE user_id=u.id;
  RETURN jsonb_build_object('approved',member_role IS NOT NULL,'role',member_role);
END;
$$;
CREATE OR REPLACE FUNCTION public.voss_business_access() RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT voss_private.access_status() $$;
REVOKE ALL ON FUNCTION voss_private.access_status(),public.voss_business_access() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION voss_private.access_status(),public.voss_business_access() TO authenticated;

CREATE OR REPLACE FUNCTION voss_private.team_access(p_user uuid DEFAULT NULL,p_approve boolean DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  PERFORM voss_private.require_owner();
  IF NOT EXISTS(SELECT 1 FROM voss_private.business_owners WHERE user_id=auth.uid() AND role='technical') THEN RAISE EXCEPTION 'Technical administrator access required' USING ERRCODE='42501'; END IF;
  IF p_user IS NOT NULL THEN
    IF p_user=auth.uid() THEN RAISE EXCEPTION 'You cannot change your own access here'; END IF;
    IF p_approve IS NULL THEN RAISE EXCEPTION 'Choose approve or revoke'; END IF;
    IF NOT EXISTS(SELECT 1 FROM voss_private.business_access_requests r JOIN auth.users u ON u.id=r.user_id WHERE r.user_id=p_user AND u.email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'A verified account must request access first'; END IF;
    IF p_approve THEN INSERT INTO voss_private.business_owners(user_id,role) VALUES(p_user,'owner') ON CONFLICT DO NOTHING;
    ELSE DELETE FROM voss_private.business_owners WHERE user_id=p_user AND role='owner'; END IF;
  END IF;
  RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.user_id,'email',r.email,'approved',o.user_id IS NOT NULL,'role',o.role) ORDER BY r.requested_at),'[]') FROM voss_private.business_access_requests r LEFT JOIN voss_private.business_owners o ON o.user_id=r.user_id);
END;
$$;
CREATE OR REPLACE FUNCTION public.voss_business_team(p_user uuid DEFAULT NULL,p_approve boolean DEFAULT NULL) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT voss_private.team_access(p_user,p_approve) $$;
REVOKE ALL ON FUNCTION voss_private.team_access(uuid,boolean),public.voss_business_team(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION voss_private.team_access(uuid,boolean),public.voss_business_team(uuid,boolean) TO authenticated;
