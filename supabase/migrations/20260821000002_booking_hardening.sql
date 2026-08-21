-- Expand the original Hans Zimmer demo to a venue-sized seat inventory.
-- Existing demo seat status is preserved; newly added seats start available.



-- Realtime clients need old row values when a seat is deleted or released.
ALTER TABLE show_seats REPLICA IDENTITY FULL;
