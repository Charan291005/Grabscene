# System Design: GrabScene Ticketing Engine

GrabScene is engineered to solve the most notorious challenge in event ticketing: concurrent checkout racing. When an event launches, thousands of users may attempt to select the exact same seat simultaneously. If the backend fails to orchestrate these requests properly, it results in double-bookings, phantom holds, and an abysmal user experience. 

This document outlines the architectural decisions and database mechanisms implemented in GrabScene to guarantee ACID compliance, prevent concurrency anomalies, and automate the waitlist lifecycle.

## 1. Concurrency Prevention & Row-Level Locking

The foundational requirement of a ticketing system is that two users must never successfully hold or book the same seat at the same time. To achieve this, GrabScene pushes the concurrency control down to the lowest possible level: the PostgreSQL database engine.

When a customer selects seats on the frontend, the client dispatches a request to the backend, which in turn calls the `hold_seats` Remote Procedure Call (RPC) in Postgres. 

Inside this RPC, GrabScene utilizes the `SELECT ... FOR UPDATE` clause:
```sql
SELECT id FROM show_seats 
WHERE show_id = p_show_id 
AND id = ANY(p_seat_ids) 
AND status = 'available' 
FOR UPDATE;
```
The `FOR UPDATE` lock is the critical component. It physically locks the rows representing the requested seats. If two customers request the same seat simultaneously, Postgres serializes the requests. The first transaction acquires the lock and proceeds to update the status to `held`. The second transaction is forced to wait. Once the first transaction completes, the second transaction attempts to read the row, but discovers the status is no longer `available`, immediately aborting the operation and throwing a clean conflict error to the frontend.

This guarantees absolute protection against double-booking without requiring external distributed locks (like Redis) or complex application-level mutexes.

## 2. Seat Hold TTL (Time-To-Live) Mechanism

Once a seat is successfully locked by a customer, it is placed in a `held` state. This removes the seat from the available pool so other customers cannot select it. However, if the customer abandons their checkout, the seat must be automatically released back into the pool.

GrabScene manages this via a database-level Time-To-Live (TTL) mechanism.

When the `hold_seats` RPC executes, it stamps the held seats with a `hold_expires_at` timestamp, calculated as `NOW() + INTERVAL '10 minutes'`. 

To enforce this TTL, GrabScene utilizes a scheduled chron job (via pg_cron or an external worker) that periodically executes the `release_expired_holds` RPC:
```sql
UPDATE show_seats
SET status = 'available', held_by = NULL, hold_expires_at = NULL
WHERE status = 'held' AND hold_expires_at < NOW();
```
Additionally, the system acts defensively. If a customer attempts to confirm a booking on a seat where the TTL has already expired (even if the cleanup job hasn't run yet), the `confirm_booking` RPC explicitly validates `hold_expires_at > NOW()`. If the hold is stale, the transaction is rejected. This creates a fail-safe environment where expired holds can never accidentally convert into bookings.

## 3. Waitlist Auto-Assignment Flow

For highly anticipated events, seats sell out quickly. GrabScene offers a dynamic waitlist feature that queues users for specific seat categories (e.g., "VIP", "Standard"). 

The waitlist is fundamentally event-driven. It does not require manual intervention from the Organiser. The trigger for the waitlist cascade is the cancellation of an existing booking. 

When a user cancels their ticket, the system executes the `cancel_booking_and_reallocate` RPC. This function performs a tightly coupled, atomic sequence:
1. **Verify and Cancel:** The original booking is locked `FOR UPDATE` and its status is set to `cancelled`.
2. **Identify Next in Line:** The system queries the `waitlist` table for the specific `show_id` and `venue_section_id` (category) of the freed seats. It orders the results by `created_at ASC` to ensure a strict First-In-First-Out (FIFO) queue.
3. **Reallocate:** If a waitlisted user is found, the system immediately changes the status of the newly freed seat to `offered` and assigns it to the waitlisted user. 

This atomic transition guarantees that a cancelled seat never momentarily flashes as `available` to the general public if there is an active waitlist queue for that category.

## 4. Time-Limited Offer Handling

When a waitlisted user is assigned an `offered` seat, they are not automatically billed. Instead, they must explicitly claim and pay for the ticket.

To maintain momentum, these offers are strictly time-limited. When the allocation occurs, the system records an `offer_expires_at` timestamp (e.g., 24 hours from the moment of cancellation). 

The user receives a transactional email containing a magic link. This link directs them to a specialized checkout flow that bypasses the standard seat map, injecting them directly into the payment gateway for their specifically reserved seats.

If the waitlisted user fails to complete the checkout before the `offer_expires_at` deadline, a secondary sweeping RPC (`cycle_expired_offers`) triggers. This function identifies expired offers, revokes the reservation from the current user, marks their waitlist status as `expired`, and immediately recursively calls the reallocation logic to offer the seat to the *next* person in the queue. 

This self-healing queue ensures that inventory is never permanently stranded by unresponsive waitlist members, maximizing occupancy and revenue for the Organiser.
