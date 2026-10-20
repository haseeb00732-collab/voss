-- Customer records are reachable only through the existing checked RPC functions.
-- Keep RLS enabled as a second layer. No data or policies are removed.
REVOKE ALL ON TABLE public.voss_orders,public.voss_order_items,public.voss_order_history,public.voss_business_events,public.voss_notification_outbox FROM anon,authenticated;
