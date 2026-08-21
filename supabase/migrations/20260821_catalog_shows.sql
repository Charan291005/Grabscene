-- Add the public event catalog without changing the existing waitlist demo show.

UPDATE events
SET title = 'Hans Zimmer Live',
    description = 'A cinematic live orchestra experience featuring the music of Hans Zimmer.'
WHERE id = 'eeeeaaaa-eeee-aaaa-eeee-aaaaeeeeaaaa';

INSERT INTO events (id, organiser_id, title, description)
VALUES
  ('eeeecccc-eeee-cccc-eeee-cccceeeecccc', '22222222-2222-2222-2222-222222222222', 'Fred Again..', 'An immersive electronic set built for a stadium-sized singalong.'),
  ('eeeedddd-eeee-dddd-eeee-ddddeeeedddd', '22222222-2222-2222-2222-222222222222', 'The Weeknd: After Hours', 'The After Hours atmosphere arrives for one unforgettable night.'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Coldplay: Spheres Tour', 'A vivid stadium show with anthems, lights, and a planet-sized production.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO shows (id, event_id, venue_id, start_time, end_time)
VALUES
  ('55556666-5555-6666-5555-666655556666', 'eeeecccc-eeee-cccc-eeee-cccceeeecccc', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', '2026-09-05 19:30:00+01', '2026-09-05 22:30:00+01'),
  ('55553333-5555-3333-5555-333355553333', 'eeeedddd-eeee-dddd-eeee-ddddeeeedddd', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', '2026-10-12 20:00:00-04', '2026-10-12 23:00:00-04'),
  ('55554444-5555-4444-5555-444455554444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', '2026-11-18 19:00:00-05', '2026-11-18 22:00:00-05')
ON CONFLICT (id) DO NOTHING;

INSERT INTO seats (section_id, row_identifier, seat_identifier)
SELECT section_id, chr(65 + ((seat_number - 1) / 20)), ((seat_number - 1) % 20 + 1)::TEXT
FROM (
  SELECT 'cccc3333-cccc-3333-cccc-3333cccc3333'::UUID AS section_id, generate_series(1, 160) AS seat_number
  UNION ALL
  SELECT 'dddd4444-dddd-4444-dddd-4444dddd4444'::UUID, generate_series(1, 160)
) catalog_seats
ON CONFLICT (section_id, row_identifier, seat_identifier) DO NOTHING;

INSERT INTO show_seats (show_id, seat_id, status, price)
SELECT show_id, seats.id, 'available'::seat_status,
  CASE WHEN seats.section_id = 'cccc3333-cccc-3333-cccc-3333cccc3333'::UUID THEN 150.00 ELSE 45.00 END
FROM (
  SELECT '55556666-5555-6666-5555-666655556666'::UUID AS show_id
  UNION ALL SELECT '55553333-5555-3333-5555-333355553333'::UUID
  UNION ALL SELECT '55554444-5555-4444-5555-444455554444'::UUID
) catalog_shows
CROSS JOIN seats
WHERE seats.section_id IN (
  'cccc3333-cccc-3333-cccc-3333cccc3333'::UUID,
  'dddd4444-dddd-4444-dddd-4444dddd4444'::UUID
)
ON CONFLICT (show_id, seat_id) DO NOTHING;
