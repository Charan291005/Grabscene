-- Migration: 20260821_cron_setup.sql
-- Description: Enable pg_cron and create the release_held_seats RPC.

-- 1. Enable pg_cron (Requires superuser privileges in a real Postgres DB, Supabase enables this by default if enabled in extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Explicit Abandonment RPC
-- Used when a user cancels their hold manually or closes the tab.
CREATE OR REPLACE FUNCTION release_held_seats(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_seat RECORD;
BEGIN
    -- Explicitly lock seats in a consistent order to prevent deadlocks
    FOR v_seat IN 
        SELECT id, status, held_by
        FROM show_seats 
        WHERE show_id = p_show_id AND id = ANY(p_seat_ids)
        ORDER BY id
        FOR UPDATE
    LOOP
        -- Only release if it's currently held by the requesting user
        IF v_seat.status = 'held' AND v_seat.held_by = p_user_id THEN
            UPDATE show_seats
            SET 
                status = 'available',
                held_by = NULL,
                hold_expires_at = NULL,
                version = version + 1
            WHERE id = v_seat.id;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Schedule the release_expired_holds background sweeper
-- Note: In Supabase, the background worker uses the postgres database and needs to connect as a specific role.
-- We schedule it to run every 1 minute.
SELECT cron.schedule(
  'release-expired-holds-every-minute',
  '* * * * *', 
  $$ SELECT release_expired_holds(); $$
);
