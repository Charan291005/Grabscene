-- Expand the original Hans Zimmer demo to a venue-sized seat inventory.
-- Existing demo seat status is preserved; newly added seats start available.

INSERT INTO show_seats (show_id, seat_id, status, price)
SELECT
  '55551111-5555-1111-5555-111155551111'::UUID,
  seats.id,
  'available'::seat_status,
  CASE
    WHEN seats.section_id = 'cccc3333-cccc-3333-cccc-3333cccc3333'::UUID THEN 150.00
    ELSE 45.00
  END
FROM seats
WHERE seats.section_id IN (
  'cccc3333-cccc-3333-cccc-3333cccc3333'::UUID,
  'dddd4444-dddd-4444-dddd-4444dddd4444'::UUID
)
ON CONFLICT (show_id, seat_id) DO NOTHING;

-- Realtime clients need old row values when a seat is deleted or released.
ALTER TABLE show_seats REPLICA IDENTITY FULL;
