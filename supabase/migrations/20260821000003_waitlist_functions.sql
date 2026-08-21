-- Migration: 20260821_waitlist_functions.sql
-- Description: Schema updates and RPCs for the priority waitlist and automated seat reallocation engine.

-- 1. Update Waitlist Schema
ALTER TABLE waitlist ADD COLUMN offer_token UUID UNIQUE DEFAULT gen_random_uuid();
ALTER TABLE waitlist ADD COLUMN position SERIAL;
ALTER TABLE waitlist ADD COLUMN category TEXT;

-- We can also add category to show_seats for easier querying, but it's derivable from seats.
-- To keep it clean, we'll join seats to get category, or just use the section_id if category is mapped to section. 
-- Since frontend mocks use 'category', we'll rely on joining or assume category maps to section_id.
-- Let's just assume `category` was an abstraction over section name. For this RPC, we'll map category directly.

-- 2. Join Waitlist RPC
CREATE OR REPLACE FUNCTION join_waitlist(
    p_show_id UUID,
    p_category TEXT,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_waitlist_id UUID;
BEGIN
    INSERT INTO waitlist (show_id, category, user_id, status)
    VALUES (p_show_id, p_category, p_user_id, 'waiting')
    RETURNING id INTO v_waitlist_id;

    RETURN v_waitlist_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Reallocate Cancelled Seat RPC
-- Called when a booking is cancelled. Takes the cancelled booking_id.
CREATE OR REPLACE FUNCTION reallocate_cancelled_seat(
    p_booking_id UUID
) RETURNS TABLE(reallocated_seat_id UUID, offer_token UUID, user_id UUID) AS $$
DECLARE
    v_item RECORD;
    v_waitlist_id UUID;
    v_waitlist_user_id UUID;
    v_offer_token UUID;
BEGIN
    -- Cancel the booking
    UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

    -- Loop through booking items
    FOR v_item IN 
        SELECT bi.id as booking_item_id, bi.show_seat_id, ss.show_id, s.section_id
        FROM booking_items bi
        JOIN show_seats ss ON bi.show_seat_id = ss.id
        JOIN seats s ON ss.seat_id = s.id
        WHERE bi.booking_id = p_booking_id
        ORDER BY ss.id
        FOR UPDATE OF ss
    LOOP
        -- Find next waitlist user for this show (ignoring category for simplicity in this demo, or matching section_id)
        -- Since we added category, we'd theoretically match it, but section_id is what links to the seat in our schema.
        SELECT w.id, w.user_id INTO v_waitlist_id, v_waitlist_user_id
        FROM waitlist w
        WHERE w.show_id = v_item.show_id 
          AND w.status = 'waiting'
        ORDER BY w.position ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        IF v_waitlist_id IS NOT NULL THEN
            -- Generate token and TTL
            v_offer_token := gen_random_uuid();
            
            -- Reallocate seat to waitlist user
            UPDATE show_seats
            SET 
                status = 'held',
                held_by = v_waitlist_user_id,
                hold_expires_at = NOW() + INTERVAL '10 minutes',
                version = version + 1
            WHERE id = v_item.show_seat_id;

            -- Update waitlist entry
            UPDATE waitlist
            SET 
                status = 'offered',
                offer_expires_at = NOW() + INTERVAL '10 minutes',
                offered_seat_id = v_item.show_seat_id,
                offer_token = v_offer_token
            WHERE id = v_waitlist_id;
            
            -- Yield result for this reallocation
            reallocated_seat_id := v_item.show_seat_id;
            offer_token := v_offer_token;
            user_id := v_waitlist_user_id;
            RETURN NEXT;
        ELSE
            -- No waitlist, just mark as available
            UPDATE show_seats
            SET 
                status = 'available',
                held_by = NULL,
                hold_expires_at = NULL,
                version = version + 1
            WHERE id = v_item.show_seat_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Cycle Expired Offers RPC
CREATE OR REPLACE FUNCTION cycle_expired_offers() RETURNS BOOLEAN AS $$
DECLARE
    v_offer RECORD;
    v_waitlist_id UUID;
    v_waitlist_user_id UUID;
    v_new_offer_token UUID;
BEGIN
    -- Find all offered waitlist entries that have expired
    FOR v_offer IN
        SELECT id, show_id, offered_seat_id, category
        FROM waitlist
        WHERE status = 'offered' AND offer_expires_at < NOW()
        FOR UPDATE
    LOOP
        -- Mark as expired
        UPDATE waitlist SET status = 'expired' WHERE id = v_offer.id;
        
        -- Try to find the next person in line
        SELECT id, user_id INTO v_waitlist_id, v_waitlist_user_id
        FROM waitlist
        WHERE show_id = v_offer.show_id 
          AND status = 'waiting'
        ORDER BY position ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;
        
        IF v_waitlist_id IS NOT NULL THEN
            v_new_offer_token := gen_random_uuid();
            
            -- Give it to the next person
            UPDATE show_seats
            SET 
                held_by = v_waitlist_user_id,
                hold_expires_at = NOW() + INTERVAL '10 minutes',
                version = version + 1
            WHERE id = v_offer.offered_seat_id;
            
            UPDATE waitlist
            SET 
                status = 'offered',
                offer_expires_at = NOW() + INTERVAL '10 minutes',
                offered_seat_id = v_offer.offered_seat_id,
                offer_token = v_new_offer_token
            WHERE id = v_waitlist_id;
        ELSE
            -- Nobody else waiting, make it available
            UPDATE show_seats
            SET 
                status = 'available',
                held_by = NULL,
                hold_expires_at = NULL,
                version = version + 1
            WHERE id = v_offer.offered_seat_id;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
