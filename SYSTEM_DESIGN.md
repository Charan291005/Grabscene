# GrabScene System Design Architecture

## 1. Concurrency Protection for Simultaneous Seat Selection

GrabScene is engineered to handle thousands of concurrent users competing for the same high-demand inventory. To prevent double-booking and ensure strict ACID compliance, all state mutations are deferred to the database layer via PostgreSQL Remote Procedure Calls (RPCs). 

When a user attempts to select seats, the `hold_seats` RPC executes. Instead of relying on client-side state or vulnerable application-layer checks, the database employs pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`). Crucially, to prevent deadlocks when multiple transactions attempt to lock overlapping sets of seats, the RPC enforces a deterministic locking order by appending `ORDER BY id` to the selection query. 

Furthermore, every seat incorporates a `version` integer column. Whenever a seat's state transitions (from available to held, or held to booked), the version increments. This guarantees idempotent transactions; if a race condition sneaks past the initial lock acquisition, the version mismatch will abort the conflicting transaction. Optimistic UI updates on the client side instantly turn the seat green to simulate a lock, but gracefully revert with an error toast if the RPC fails.

## 2. Seat Hold TTL and Auto-Release Mechanism

To prevent users from indefinitely hoarding inventory without purchasing, GrabScene enforces a strict 10-minute Time-To-Live (TTL) on all active holds. 

This mechanism is driven by a dual-layer architecture:
- **Client Synchronization**: The frontend timer (`useHoldTimer`) calculates remaining time strictly against the server-generated `hold_expires_at` timestamp. This neutralizes client-side clock tampering. Furthermore, attaching a `keepalive: true` fetch beacon to the `beforeunload` browser event ensures that if a user abandons their tab, the database immediately reclaims the hold.
- **Server Sweeper**: To catch orphaned holds (e.g., from network drops or browser crashes), we utilize the `pg_cron` PostgreSQL extension. A background worker executes the `release_expired_holds` RPC every 60 seconds. This query rapidly scans the `show_seats` table for rows where `status = 'held'` and `hold_expires_at < NOW()`, atomically reverting them to `available` and clearing the lock.

## 3. Waitlist Auto-Assignment & Time-Limited Offer Flow

Sold-out events activate GrabScene’s Priority Waitlist Engine. This system guarantees fair, automated reallocation of cancelled inventory without manual organiser intervention.

The `waitlist` table operates as a strict, monotonic FIFO queue, enforced by a `position` serial column. When a confirmed booking is cancelled, the `cancel_booking_and_reallocate` RPC triggers an atomic reallocation cascade. It retrieves the freed seats and simultaneously scans the waitlist for the earliest user matching the specific venue category.

If a match is found, the transaction bypasses the public pool entirely. It instantly transitions the seat back to a `held` state assigned to the waitlisted user. Simultaneously, it generates a cryptographically secure `offer_token` (UUIDv4) and injects a new 10-minute TTL (`offer_expires_at`). A transactional email is dispatched via Resend, directing the user to a secure `/checkout/claim` route. 

If the user fails to complete the purchase within the window, a Next.js Edge cron route (`/api/cron/process-expired-offers`) sweeps the expired offer and recursively invokes the reallocation logic, passing the ticket to the next person in line.

## 4. Seat Map Data Model & Real-Time WebSocket Architecture

The visual core of GrabScene is the interactive seat map, designed to reflect the live heartbeat of an event.

The data model normalizes physical infrastructure and temporal event data. The `seats` table defines the immutable physical layout of a venue (sections, rows, seat numbers). The `show_seats` table acts as the volatile junction, linking a specific performance (`show_id`) to a physical seat (`seat_id`), while tracking price, current status (`available`, `held`, `booked`), and the ephemeral lock owner.

To achieve real-time presence without crippling the database with polling queries, the platform leverages Supabase Realtime (PostgreSQL logical replication over WebSockets). The `useShowSeatsRealtime` React hook subscribes exclusively to `UPDATE` events on the `show_seats` table filtered by the active `show_id`. When a seat's status changes anywhere in the world, the database broadcasts the row delta. The client’s React state merges this payload instantly, causing the SVG map to dynamically shift colors—rendering the high-concurrency booking frenzy visible to all connected users in real-time.
