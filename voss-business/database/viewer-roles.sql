-- Read-only membership is distinct from mutation authorization.
ALTER TABLE voss_private.business_owners DROP CONSTRAINT IF EXISTS business_owners_role_check;
ALTER TABLE voss_private.business_owners ADD CONSTRAINT business_owners_role_check CHECK(role IN ('technical','owner','viewer'));
CREATE OR REPLACE FUNCTION voss_private.require_member() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM voss_private.business_owners WHERE user_id=auth.uid()) THEN RAISE EXCEPTION 'Business access required' USING ERRCODE='42501'; END IF;
END $$;
-- A viewer must be revocable through the existing team screen as well.
DO $$ DECLARE definition text; BEGIN
 definition:=pg_get_functiondef('voss_private.team_access(uuid,boolean)'::regprocedure);
 EXECUTE replace(definition,$old$role='owner'$old$,$new$role IN ('owner','viewer')$new$);
END $$;
CREATE OR REPLACE FUNCTION voss_private.require_owner() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM voss_private.business_owners WHERE user_id=auth.uid() AND role IN ('technical','owner')) THEN RAISE EXCEPTION 'Owner access required' USING ERRCODE='42501'; END IF;
END $$;
REVOKE ALL ON FUNCTION voss_private.require_member() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION voss_private.require_member() TO authenticated;
-- Only read functions change their guard. All writes keep require_owner.
DO $$ DECLARE fn regprocedure;definition text; BEGIN
 FOREACH fn IN ARRAY ARRAY['voss_private.business_read(text,text,text,integer,uuid)'::regprocedure,'voss_private.finance_read(date,date)'::regprocedure,'voss_private.finance_read_before_upgrade(date,date)'::regprocedure,'public.voss_order_finance_read(uuid)'::regprocedure] LOOP
  definition:=pg_get_functiondef(fn);
  EXECUTE replace(definition,'PERFORM voss_private.require_owner();','PERFORM voss_private.require_member();');
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.voss_team_role(p_user uuid,p_role text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM voss_private.business_owners WHERE user_id=auth.uid() AND role='technical') THEN RAISE EXCEPTION 'Technical administrator required' USING ERRCODE='42501'; END IF;
 IF p_user=auth.uid() OR p_role NOT IN ('owner','viewer') THEN RAISE EXCEPTION 'Choose an owner or viewer role for another team member'; END IF;
 IF NOT EXISTS(SELECT 1 FROM voss_private.business_access_requests r JOIN auth.users u ON u.id=r.user_id WHERE r.user_id=p_user AND u.email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'Verified sign-in required first'; END IF;
 INSERT INTO voss_private.business_owners(user_id,role) VALUES(p_user,p_role) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role WHERE business_owners.role<>'technical';
 INSERT INTO voss_private.finance_audit(entity,entity_id,actor_id,new_value) VALUES('team_role',p_user::text,auth.uid(),jsonb_build_object('role',p_role));
END $$;
REVOKE ALL ON FUNCTION public.voss_team_role(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.voss_team_role(uuid,text) TO authenticated;
