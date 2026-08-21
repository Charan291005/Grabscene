# GrabScene System Design & Architecture

This document provides a comprehensive technical overview of the GrabScene ticket booking platform, focusing specifically on the high-concurrency booking engine, seat hold mechanisms (TTL), waitlist flow, and the backend concurrency protection that makes the system robust against massive traffic spikes.

## 1. Concurrency Protection & Acid Transactions

In a high-demand ticketing system (e.g., BookMyShow, Ticketmaster), the most critical failure point is when thousands of users attempt to purchase the exact same seat simultaneously. 

### Mechanism: Row-Level Locking (`SELECT FOR UPDATE`)
GrabScene solves this entirely within the PostgreSQL database using ACID-compliant transactions and row-level locking.

When a customer attempts to place a hold on seats (via the `/api/seats/hold` endpoint), the backend initiates a transaction and executes the `hold_seats` Remote Procedure Call (RPC). 
The core of this RPC is:
```sql
SELECT id, status 
FROM show_seats 
WHERE id = ANY(p_seat_ids) 
ORDER BY id 
FOR UPDATE;
```

**Why this works:**
- **`FOR UPDATE`**: This clause forces the database to lock the specific rows being read. If User A and User B request the same seat at the exact same millisecond, the database serialises their requests. User A gets the lock, updates the status to `held`, and commits. User B's transaction waits for the lock. When it finally reads the row, the status is already `held`, and the transaction gracefully fails.
- **`ORDER BY id`**: This prevents deadlocks. If User A requests seats [1, 2] and User B requests seats [2, 1], locking them in arbitrary order could cause a deadlock where A waits for 2 and B waits for 1. By sorting the IDs before locking, both users request the locks in the exact same sequence.

## 2. Seat Hold and TTL (Time-To-Live) Mechanism

When users select seats, they are placed on "hold" to give them time to complete checkout without losing their seats.

### Mechanism: Timestamp Expiry and Cron Processing
When the `hold_seats` RPC runs successfully, it updates the `show_seats` row:
- `status` -> `held`
- `held_by` -> `user_id`
- `hold_expires_at` -> `NOW() + INTERVAL '10 minutes'`

**Auto-Release (Abandonment)**
If the user closes their browser or abandons the checkout, the seats must be returned to the available pool. We do not rely on the frontend or a single long-running Node.js timeout for this, as servers can crash. 
Instead, we use a database-driven cron job.

We use `pg_cron` (via Supabase) to trigger the `release_expired_holds` RPC every minute:
```sql
UPDATE show_seats
SET status = 'available', held_by = NULL, hold_expires_at = NULL
WHERE status = 'held' AND hold_expires_at < NOW();
```
This guarantees that orphaned holds are aggressively purged and the seat map is updated for all users in real-time.

## 3. Waitlist Auto-Assignment Flow

When high-demand events sell out (i.e. all seats are `booked`), customers can join a waitlist for specific categories (e.g., VIP, Standard).

### Mechanism: FIFO Queue
When joining the waitlist, the `join_waitlist` RPC calculates the user's priority based on their `created_at` timestamp. It acts as a strict First-In-First-Out (FIFO) queue.

### Reallocation Cascade
When a confirmed booking is cancelled, we do not simply release the seat back to the public pool. Instead, the `cancel_booking_and_reallocate` RPC is triggered.

1. **Cancellation**: The booking is voided.
2. **Reallocation Check**: The system searches the `waitlist` table for the oldest entry matching the `show_id` and `category` of the cancelled seat.
3. **Status Update**: If a match is found, the waitlist entry's status is changed from `pending` to `offered`.
4. **Time-Limited Offer**: The `offer_expires_at` timestamp is set (e.g., NOW + 10 minutes). The seat's status remains pseudo-booked so the general public cannot grab it.

## 4. Time-Limited Offer Handling and Notification

Once a waitlist entry enters the `offered` state, two things happen:

### Email Delivery
The backend API detects the reallocation and triggers a Resend email containing a time-limited link: `grabscene.com/checkout/claim?token=[waitlist_id]`. This email (built with React Email) uses high-urgency messaging to prompt the user to claim their seat.

### Offer Expiry Cascade
Similar to seat holds, waitlist offers can be abandoned. We run another background cron (`cycle_expired_offers`) every minute.
If an offer expires without being claimed, the RPC:
1. Marks the current waitlist entry as `expired`.
2. Automatically loops back to the reallocation phase, finding the *next* person in line.
3. Creates a new time-limited offer for them.

This creates a highly efficient, automated cascade where a single cancelled ticket bounces down the waitlist until someone finally purchases it, ensuring the organiser achieves maximum revenue without manual intervention.

## Summary
By offloading state management, concurrency control, and TTL expirations to the PostgreSQL database via stored procedures and row-locking, the Node.js API remains purely stateless and horizontally scalable. This design ensures GrabScene can handle immense ticket drop traffic without race conditions or data corruption.
