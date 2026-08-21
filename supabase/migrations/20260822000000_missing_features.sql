-- Migration: 20260822_missing_features.sql
-- Description: Add missing RPCs, columns, and fix RPC call surface for full spec compliance.

-- 1. Add missing columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'concert';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- 2. RPC: release_held_seats (explicit manual release by user)
CREATE OR REPLACE FUNCTION release_held_seats(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE show_seats
    SET 
        status = 'available',
        held_by = NULL,
        hold_expires_at = NULL,
        version = version + 1
    WHERE 
        show_id = p_show_id 
        AND id = ANY(p_seat_ids)
        AND held_by = p_user_id
        AND status = 'held';

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- 3. RPC: join_waitlist (insert into waitlist with duplicate check)
CREATE OR REPLACE FUNCTION join_waitlist(
    p_show_id UUID,
    p_section_id UUID,
    p_user_id UUID
) RETURNS TABLE(waitlist_id UUID, queue_position BIGINT) AS $$
DECLARE
    v_existing UUID;
    v_id UUID;
    v_pos BIGINT;
BEGIN
    -- Check if user is already on waitlist for this show+section
    SELECT id INTO v_existing 
    FROM waitlist 
    WHERE user_id = p_user_id 
      AND show_id = p_show_id 
      AND (section_id = p_section_id OR (section_id IS NULL AND p_section_id IS NULL))
      AND status = 'waiting';

    IF v_existing IS NOT NULL THEN
        RAISE EXCEPTION 'User is already on the waitlist for this section.';
    END IF;

    -- Insert new waitlist entry
    INSERT INTO waitlist (user_id, show_id, section_id, status, priority)
    VALUES (p_user_id, p_show_id, p_section_id, 'waiting', 0)
    RETURNING id INTO v_id;

    -- Calculate queue position
    SELECT COUNT(*) INTO v_pos
    FROM waitlist
    WHERE show_id = p_show_id
      AND (section_id = p_section_id OR (section_id IS NULL AND p_section_id IS NULL))
      AND status = 'waiting';

    waitlist_id := v_id;
    queue_position := v_pos;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;


-- 4. RPC: cycle_expired_offers (cascade expired waitlist offers to next user)
CREATE OR REPLACE FUNCTION cycle_expired_offers() RETURNS BOOLEAN AS $$
DECLARE
    v_offer RECORD;
    v_next_waitlist_id UUID;
    v_next_user_id UUID;
BEGIN
    -- Find all expired offers
    FOR v_offer IN
        SELECT w.id, w.show_id, w.section_id, w.offered_seat_id, w.user_id
        FROM waitlist w
        WHERE w.status = 'offered'
          AND w.offer_expires_at < NOW()
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Mark expired offer
        UPDATE waitlist SET status = 'expired' WHERE id = v_offer.id;

        -- Release the seat first
        UPDATE show_seats
        SET 
            status = 'available',
            held_by = NULL,
            hold_expires_at = NULL,
            version = version + 1
        WHERE id = v_offer.offered_seat_id;

        -- Find next waitlist user for same show+section
        SELECT id, user_id INTO v_next_waitlist_id, v_next_user_id
        FROM waitlist
        WHERE show_id = v_offer.show_id
          AND (section_id = v_offer.section_id OR section_id IS NULL)
          AND status = 'waiting'
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        IF v_next_waitlist_id IS NOT NULL THEN
            -- Reallocate seat to next user
            UPDATE show_seats
            SET 
                status = 'held',
                held_by = v_next_user_id,
                hold_expires_at = NOW() + INTERVAL '10 minutes',
                version = version + 1
            WHERE id = v_offer.offered_seat_id;

            -- Update waitlist entry
            UPDATE waitlist
            SET 
                status = 'offered',
                offer_expires_at = NOW() + INTERVAL '10 minutes',
                offered_seat_id = v_offer.offered_seat_id
            WHERE id = v_next_waitlist_id;
        END IF;
    END LOOP;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- 5. RPC: get_waitlist_depth (get queue depth for a show+section)
CREATE OR REPLACE FUNCTION get_waitlist_depth(
    p_show_id UUID,
    p_section_id UUID
) RETURNS BIGINT AS $$
DECLARE
    v_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM waitlist
    WHERE show_id = p_show_id
      AND (section_id = p_section_id OR (section_id IS NULL AND p_section_id IS NULL))
      AND status = 'waiting';
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
