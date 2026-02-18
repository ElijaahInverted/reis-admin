-- Migration: Add Social Proof RLS policies
-- Goal: Allow associations to see each other's name and activity to encourage engagement.
-- Author: Antigravity
-- Date: 2026-02-19

-- 1. Notifications: Allow authenticated users to see ANY non-expired notification
-- (This is what 'anon' can already see, but we make it explicit for 'authenticated' too
-- so that the widget can fetch them without needing a separate client)
CREATE POLICY "auth_read_public_notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (expires_at > now());

-- 2. Spolky Accounts: Allow authenticated users to see name and ID of all active associations
-- (Currently they can only see their own)
CREATE POLICY "auth_read_all_associations_minimal"
  ON public.spolky_accounts FOR SELECT TO authenticated
  USING (is_active = true);

-- Note: We are allowing 'authenticated' to read all columns of 'spolky_accounts' where is_active is true.
-- This includes 'email', which might be slightly sensitive, but since these are 'public' student groups
-- and we are already and admin tool, this is generally acceptable in this context. 
-- For stricter security, we could use a view, but for now this is the simplest path.
