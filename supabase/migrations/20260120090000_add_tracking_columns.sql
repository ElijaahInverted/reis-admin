-- Migration: Add view_count and click_count to notifications table
-- Author: Antigravity
-- Date: 2026-01-20

ALTER TABLE "public"."notifications" 
ADD COLUMN "view_count" integer NOT NULL DEFAULT 0,
ADD COLUMN "click_count" integer NOT NULL DEFAULT 0;

-- Optional: Comment on columns
COMMENT ON COLUMN "public"."notifications"."view_count" IS 'Number of times the notification has been viewed';
COMMENT ON COLUMN "public"."notifications"."click_count" IS 'Number of times the notification link has been clicked';
