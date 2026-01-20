-- Migration: Add RPC functions for safe view/click incrementing
-- Author: Antigravity
-- Date: 2026-01-20

-- Function to safely increment view_count
CREATE OR REPLACE FUNCTION public.increment_notification_view(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET view_count = view_count + 1
  WHERE id = row_id;
END;
$$;

-- Function to safely increment click_count
CREATE OR REPLACE FUNCTION public.increment_notification_click(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET click_count = click_count + 1
  WHERE id = row_id;
END;
$$;

-- Grant execute permissions to authenticated users and anon (if public view is allowed)
-- Assuming only authenticated users (extension users) should count views? 
-- Actually, if the extension uses a specific key, usually authenticated.
GRANT EXECUTE ON FUNCTION public.increment_notification_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_notification_click(uuid) TO authenticated;

-- Optional: Comments
COMMENT ON FUNCTION public.increment_notification_view IS 'Atomically increments view_count for a notification';
COMMENT ON FUNCTION public.increment_notification_click IS 'Atomically increments click_count for a notification';
