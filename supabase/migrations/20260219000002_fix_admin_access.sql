-- Migration: Fix Admin Access
-- Goal: Restore reis_admin role to reis.mendelu@gmail.com and demote all others.
-- Author: Antigravity
-- Date: 2026-02-19

-- 1. Ensure the primary team account is an admin
UPDATE public.spolky_accounts
SET role = 'reis_admin'
WHERE email = 'reis.mendelu@gmail.com';

-- 2. Demote any other accounts that might have been accidentally promoted
UPDATE public.spolky_accounts
SET role = 'association'
WHERE email != 'reis.mendelu@gmail.com' AND role = 'reis_admin';
