-- Step 1a: Add role column to spolky_accounts
ALTER TABLE public.spolky_accounts
  ADD COLUMN role text NOT NULL DEFAULT 'association'
  CHECK (role IN ('association', 'reis_admin'));

-- Step 1b: Helper function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.spolky_accounts
  WHERE email = (auth.jwt() ->> 'email') AND is_active = true
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Step 1c: Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- anon (extension): read non-expired notifications
CREATE POLICY "anon_read_notifications"
  ON public.notifications FOR SELECT TO anon
  USING (expires_at > now());

-- authenticated: read own association's rows (all, including expired) or all if reis_admin
CREATE POLICY "auth_read_notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (
    association_id = (
      SELECT association_id FROM public.spolky_accounts
      WHERE email = (auth.jwt() ->> 'email') AND is_active = true LIMIT 1
    )
    OR get_my_role() = 'reis_admin'
  );

-- authenticated: insert only for own association (or all if reis_admin)
CREATE POLICY "auth_insert_notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    association_id = (
      SELECT association_id FROM public.spolky_accounts
      WHERE email = (auth.jwt() ->> 'email') AND is_active = true LIMIT 1
    )
    OR get_my_role() = 'reis_admin'
  );

-- authenticated: delete only for own association (or all if reis_admin)
CREATE POLICY "auth_delete_notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (
    association_id = (
      SELECT association_id FROM public.spolky_accounts
      WHERE email = (auth.jwt() ->> 'email') AND is_active = true LIMIT 1
    )
    OR get_my_role() = 'reis_admin'
  );

-- Step 1d: Enable RLS on spolky_accounts
ALTER TABLE public.spolky_accounts ENABLE ROW LEVEL SECURITY;

-- authenticated: read own row (always); reis_admin can read all rows
CREATE POLICY "auth_read_spolky_accounts"
  ON public.spolky_accounts FOR SELECT TO authenticated
  USING (
    email = (auth.jwt() ->> 'email')
    OR get_my_role() = 'reis_admin'
  );

-- Step 1e: Fix RPC grants for anon (extension uses anon key to call these)
GRANT EXECUTE ON FUNCTION public.increment_notification_view(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_notification_click(uuid) TO anon;
