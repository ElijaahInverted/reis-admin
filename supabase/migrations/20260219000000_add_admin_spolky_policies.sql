-- reis_admin can insert new association accounts
CREATE POLICY "auth_insert_spolky_accounts"
  ON public.spolky_accounts FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'reis_admin');

-- reis_admin can update any account row
CREATE POLICY "auth_update_spolky_accounts"
  ON public.spolky_accounts FOR UPDATE TO authenticated
  USING (get_my_role() = 'reis_admin');
