-- Migration: 20260821_init_schema.sql
-- Description: Init schema for GrabScene with strict ACID compliance.

-- 1. Enums
CREATE TYPE user_role AS ENUM ('customer', 'organiser', 'admin');
CREATE TYPE seat_status AS ENUM ('available', 'held', 'booked');
CREATE TYPE waitlist_status AS ENUM ('waiting', 'offered', 'converted', 'expired');

-- 2. Tables

-- Note: auth.users is managed by Supabase, we reference it here.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE venue_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES venue_sections(id) ON DELETE CASCADE,
    row_identifier TEXT NOT NULL,
    seat_identifier TEXT NOT NULL,
    UNIQUE(section_id, row_identifier, seat_identifier)
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organiser_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE show_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    seat_id UUID REFERENCES seats(id) ON DELETE CASCADE,
    status seat_status DEFAULT 'available'::seat_status NOT NULL,
    held_by UUID REFERENCES profiles(id),
    hold_expires_at TIMESTAMPTZ,
    price DECIMAL(10, 2) NOT NULL,
    version INT DEFAULT 1,
    UNIQUE(show_id, seat_id)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    show_id UUID REFERENCES shows(id),
    booking_ref TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    show_seat_id UUID REFERENCES show_seats(id),
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    section_id UUID REFERENCES venue_sections(id),
    status waitlist_status DEFAULT 'waiting'::waitlist_status NOT NULL,
    priority INT DEFAULT 0,
    offer_expires_at TIMESTAMPTZ,
    offered_seat_id UUID REFERENCES show_seats(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for concurrency and performance
CREATE INDEX idx_show_seats_show_status ON show_seats(show_id, status);
CREATE INDEX idx_show_seats_hold_expires ON show_seats(hold_expires_at) WHERE status = 'held';
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_waitlist_show_status ON waitlist(show_id, status);

-- 4. RPC Functions (ACID Compliant & Race-Condition Protected)

-- RPC 1: hold_seats
CREATE OR REPLACE FUNCTION hold_seats(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID,
    p_ttl_minutes INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_seat RECORD;
BEGIN
    -- Explicitly lock seats in a consistent order to prevent deadlocks
    FOR v_seat IN 
        SELECT id, status, hold_expires_at 
        FROM show_seats 
        WHERE show_id = p_show_id AND id = ANY(p_seat_ids)
        ORDER BY id
        FOR UPDATE
    LOOP
        IF v_seat.status = 'booked' OR (v_seat.status = 'held' AND v_seat.hold_expires_at > NOW()) THEN
            RAISE EXCEPTION 'Seat % is not available.', v_seat.id;
        END IF;
    END LOOP;

    -- Update seats transactionally with versioning
    UPDATE show_seats
    SET 
        status = 'held',
        held_by = p_user_id,
        hold_expires_at = NOW() + (p_ttl_minutes || ' minutes')::INTERVAL,
        version = version + 1
    WHERE show_id = p_show_id AND id = ANY(p_seat_ids);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- RPC 2: confirm_booking
CREATE OR REPLACE FUNCTION confirm_booking(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID,
    p_booking_ref TEXT
) RETURNS UUID AS $$
DECLARE
    v_seat RECORD;
    v_total_amount DECIMAL(10, 2) := 0;
    v_booking_id UUID;
BEGIN
    -- Lock seats in a consistent order
    FOR v_seat IN 
        SELECT id, status, held_by, hold_expires_at, price 
        FROM show_seats 
        WHERE show_id = p_show_id AND id = ANY(p_seat_ids)
        ORDER BY id
        FOR UPDATE
    LOOP
        IF v_seat.status != 'held' OR v_seat.held_by != p_user_id OR v_seat.hold_expires_at < NOW() THEN
            RAISE EXCEPTION 'Hold for seat % is invalid or expired.', v_seat.id;
        END IF;
        v_total_amount := v_total_amount + v_seat.price;
    END LOOP;

    -- Create booking
    INSERT INTO bookings (user_id, show_id, booking_ref, total_amount)
    VALUES (p_user_id, p_show_id, p_booking_ref, v_total_amount)
    RETURNING id INTO v_booking_id;

    -- Update seats to booked and increment version
    UPDATE show_seats
    SET 
        status = 'booked',
        held_by = p_user_id,
        hold_expires_at = NULL,
        version = version + 1
    WHERE show_id = p_show_id AND id = ANY(p_seat_ids);

    -- Create booking items
    INSERT INTO booking_items (booking_id, show_seat_id, price)
    SELECT v_booking_id, id, price 
    FROM show_seats 
    WHERE show_id = p_show_id AND id = ANY(p_seat_ids);

    -- Update waitlist if this seat was offered
    UPDATE waitlist
    SET status = 'converted'
    WHERE user_id = p_user_id AND show_id = p_show_id AND status = 'offered' AND offered_seat_id = ANY(p_seat_ids);

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;


-- RPC 3: release_expired_holds
CREATE OR REPLACE FUNCTION release_expired_holds() RETURNS SETOF UUID AS $$
DECLARE
    freed_ids UUID[];
BEGIN
    WITH released AS (
        UPDATE show_seats
        SET 
            status = 'available',
            held_by = NULL,
            hold_expires_at = NULL,
            version = version + 1
        WHERE 
            status = 'held' 
            AND hold_expires_at < NOW()
        RETURNING id
    )
    SELECT array_agg(id) INTO freed_ids FROM released;

    IF freed_ids IS NOT NULL THEN
        RETURN QUERY SELECT unnest(freed_ids);
    END IF;
END;
$$ LANGUAGE plpgsql;


-- RPC 4: cancel_booking_and_reallocate
CREATE OR REPLACE FUNCTION cancel_booking_and_reallocate(
    p_booking_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_booking RECORD;
    v_item RECORD;
    v_waitlist_id UUID;
    v_waitlist_user_id UUID;
BEGIN
    -- Verify and lock the booking
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND user_id = p_user_id AND status = 'confirmed' FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found, already cancelled, or not owned by user.';
    END IF;

    -- Mark booking as cancelled
    UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

    -- Loop through booking items to reallocate or make available
    FOR v_item IN 
        SELECT bi.id as booking_item_id, bi.show_seat_id, ss.show_id, s.section_id
        FROM booking_items bi
        JOIN show_seats ss ON bi.show_seat_id = ss.id
        JOIN seats s ON ss.seat_id = s.id
        WHERE bi.booking_id = p_booking_id
        ORDER BY ss.id -- Lock ordering to prevent deadlocks
        FOR UPDATE OF ss
    LOOP
        -- Find next waitlist user for this show and section
        SELECT id, user_id INTO v_waitlist_id, v_waitlist_user_id
        FROM waitlist
        WHERE show_id = v_item.show_id 
          AND (section_id = v_item.section_id OR section_id IS NULL)
          AND status = 'waiting'
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        IF v_waitlist_id IS NOT NULL THEN
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
                offered_seat_id = v_item.show_seat_id
            WHERE id = v_waitlist_id;
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

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
