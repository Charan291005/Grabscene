-- seed.sql
-- Comprehensive demo data for GrabScene evaluation.

-- 1. Create Profiles
INSERT INTO auth.users (id, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@grabscene.app'),
('22222222-2222-2222-2222-222222222222', 'organiser@grabscene.app'),
('33333333-3333-3333-3333-333333333333', 'customer1@example.com'),
('44444444-4444-4444-4444-444444444444', 'customer2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, email, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@grabscene.app', 'admin'),
('22222222-2222-2222-2222-222222222222', 'organiser@grabscene.app', 'organiser'),
('33333333-3333-3333-3333-333333333333', 'customer1@example.com', 'customer'),
('44444444-4444-4444-4444-444444444444', 'customer2@example.com', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 2. Create Venues
INSERT INTO venues (id, name, location) VALUES 
('aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Grand Horizon IMAX Cinema', 'New York'),
('bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 'CyberDome Arena', 'London')
ON CONFLICT DO NOTHING;

-- 3. Create Venue Sections & Seats (Simplified for demo)
-- Grand Horizon (Small Cinema)
INSERT INTO venue_sections (id, venue_id, name) VALUES 
('cccc3333-cccc-3333-cccc-3333cccc3333', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'VIP'),
('dddd4444-dddd-4444-dddd-4444dddd4444', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Standard')
ON CONFLICT DO NOTHING;

INSERT INTO seats (id, section_id, row_identifier, seat_identifier) VALUES 
('eeee5555-eeee-5555-eeee-5555eeee5551', 'cccc3333-cccc-3333-cccc-3333cccc3333', 'A', '1'),
('eeee5555-eeee-5555-eeee-5555eeee5552', 'cccc3333-cccc-3333-cccc-3333cccc3333', 'A', '2'),
('eeee5555-eeee-5555-eeee-5555eeee5553', 'dddd4444-dddd-4444-dddd-4444dddd4444', 'B', '1'),
('eeee5555-eeee-5555-eeee-5555eeee5554', 'dddd4444-dddd-4444-dddd-4444dddd4444', 'B', '2')
ON CONFLICT DO NOTHING;

-- CyberDome (Large Arena)
INSERT INTO venue_sections (id, venue_id, name) VALUES 
('ffff6666-ffff-6666-ffff-6666ffff6666', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 'Premium')
ON CONFLICT DO NOTHING;

INSERT INTO seats (id, section_id, row_identifier, seat_identifier) VALUES 
('00007777-0000-7777-0000-777700007771', 'ffff6666-ffff-6666-ffff-6666ffff6666', 'A', '1'),
('00007777-0000-7777-0000-777700007772', 'ffff6666-ffff-6666-ffff-6666ffff6666', 'A', '2')
ON CONFLICT DO NOTHING;

-- 4. Create Events & Shows
-- Event A: Active Browsing
INSERT INTO events (id, organiser_id, title) VALUES ('eeeeaaaa-eeee-aaaa-eeee-aaaaeeeeaaaa', '22222222-2222-2222-2222-222222222222', 'Event A (Browsing)');
INSERT INTO shows (id, event_id, venue_id, start_time, end_time) VALUES ('55551111-5555-1111-5555-111155551111', 'eeeeaaaa-eeee-aaaa-eeee-aaaaeeeeaaaa', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 2 hours');

-- Event B: Sold-Out Demo (For waitlist testing)
INSERT INTO events (id, organiser_id, title) VALUES ('eeeebbbb-eeee-bbbb-eeee-bbbbeeeebbbb', '22222222-2222-2222-2222-222222222222', 'Event B (Sold-Out)');
INSERT INTO shows (id, event_id, venue_id, start_time, end_time) VALUES ('55552222-5555-2222-5555-222255552222', 'eeeebbbb-eeee-bbbb-eeee-bbbbeeeebbbb', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours');

-- 5. Seed Show Seats
-- Event A: Mixed Availability
INSERT INTO show_seats (id, show_id, seat_id, status, price) VALUES 
(gen_random_uuid(), '55551111-5555-1111-5555-111155551111', 'eeee5555-eeee-5555-eeee-5555eeee5551', 'available', 150.00),
(gen_random_uuid(), '55551111-5555-1111-5555-111155551111', 'eeee5555-eeee-5555-eeee-5555eeee5552', 'held', 150.00), -- active hold
(gen_random_uuid(), '55551111-5555-1111-5555-111155551111', 'eeee5555-eeee-5555-eeee-5555eeee5553', 'booked', 45.00), -- already sold
(gen_random_uuid(), '55551111-5555-1111-5555-111155551111', 'eeee5555-eeee-5555-eeee-5555eeee5554', 'available', 45.00);

-- Event B: 100% Sold Out
INSERT INTO show_seats (id, show_id, seat_id, status, held_by, price) VALUES 
('88889999-8888-9999-8888-999988889991', '55552222-5555-2222-5555-222255552222', '00007777-0000-7777-0000-777700007771', 'booked', '33333333-3333-3333-3333-333333333333', 85.00),
('88889999-8888-9999-8888-999988889992', '55552222-5555-2222-5555-222255552222', '00007777-0000-7777-0000-777700007772', 'booked', '33333333-3333-3333-3333-333333333333', 85.00);

-- Insert Booking for Event B to allow cancellation test
INSERT INTO bookings (id, user_id, show_id, booking_ref, total_amount, status) VALUES 
('bbbb9999-bbbb-9999-bbbb-9999bbbb9999', '33333333-3333-3333-3333-333333333333', '55552222-5555-2222-5555-222255552222', 'GS-DEMO-TEST', 170.00, 'confirmed');

INSERT INTO booking_items (booking_id, show_seat_id, price) VALUES 
('bbbb9999-bbbb-9999-bbbb-9999bbbb9999', '88889999-8888-9999-8888-999988889991', 85.00),
('bbbb9999-bbbb-9999-bbbb-9999bbbb9999', '88889999-8888-9999-8888-999988889992', 85.00);

-- 6. Populate Waitlist for Event B
-- 4 users waiting in FIFO line
INSERT INTO waitlist (show_id, section_id, user_id, status, priority) VALUES 
('55552222-5555-2222-5555-222255552222', 'ffff6666-ffff-6666-ffff-6666ffff6666', '44444444-4444-4444-4444-444444444444', 'waiting', 4),
('55552222-5555-2222-5555-222255552222', 'ffff6666-ffff-6666-ffff-6666ffff6666', '11111111-1111-1111-1111-111111111111', 'waiting', 3),
('55552222-5555-2222-5555-222255552222', 'ffff6666-ffff-6666-ffff-6666ffff6666', '22222222-2222-2222-2222-222222222222', 'waiting', 2),
('55552222-5555-2222-5555-222255552222', 'ffff6666-ffff-6666-ffff-6666ffff6666', '33333333-3333-3333-3333-333333333333', 'waiting', 1);
