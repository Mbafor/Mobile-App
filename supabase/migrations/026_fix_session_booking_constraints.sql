-- Fix: drop overly restrictive unique index that allows only ONE active session
-- per student globally. The book_mentorship_session RPC already enforces a
-- per-calendar-week limit via v_weekly_count, so this index is redundant and
-- causes 409 Conflict errors when any prior pending/proposed/confirmed session
-- exists — even from a different week or mentorship.

-- Also auto-complete any stale sessions whose scheduled_end has passed so they
-- no longer block future bookings.

-- 1. Clean up stale sessions that should have been completed
UPDATE public.mentorship_sessions
SET
  status     = 'completed',
  ended_at   = COALESCE(ended_at, scheduled_end),
  updated_at = now()
WHERE status IN ('pending', 'proposed', 'confirmed')
  AND scheduled_end < now();

-- 2. Drop the problematic one-active-session-per-student index
DROP INDEX IF EXISTS public.mentorship_sessions_one_upcoming_per_student;

-- The coach-side unique index (one active session per coach per start time)
-- is correct and remains in place:
--   mentorship_sessions_coach_start_unique
