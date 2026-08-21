# GrabScene Ticketing Engine

GrabScene is a high-concurrency, production-grade movie and concert ticketing platform. It features strict ACID-compliant database locking, an automated hold/release lifecycle, priority waitlists, and live interactive seat maps.

## Features
- **Concurrency Protection**: Row-level locking (`SELECT ... FOR UPDATE ORDER BY id`) prevents double-bookings.
- **Auto-Release Sweepers**: `pg_cron` natively purges abandoned seat holds.
- **Priority Waitlist**: Automated FIFO queue that reallocates cancelled tickets instantly.
- **Dynamic QR Passes**: Cryptographically signed HMAC-SHA256 QR codes delivered via React Email.
- **Real-time Engine**: Supabase WebSockets push live seat status updates to all connected clients.
- **Organiser Dashboard**: High-level revenue and occupancy analytics with live heatmaps.

## Local Setup & Deployment

### 1. Prerequisites
- Node.js (v18+)
- Supabase CLI installed locally.

### 2. Installation
```bash
git clone <repo-url>
cd GrabScene
npm install
```

### 3. Database Initialization
Start the local Supabase stack and apply the migrations automatically:
```bash
supabase start
```
*Note: The database is automatically seeded with demo data via `supabase/seed.sql`. If you need to reset the database and re-seed, run `supabase db reset`.*

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key-from-supabase-start>
QR_HMAC_SECRET=super_secret_dev_key
# RESEND_API_KEY=re_123456789 (Optional: Leave commented out to use Mock Email mode)
```

### 5. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

## API Endpoint Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings/confirm` | `POST` | Finalizes a booking, generates the QR code, and triggers the Resend email. |
| `/api/bookings/cancel` | `POST` | Cancels a booking and triggers the atomic waitlist auto-reallocation RPC. |
| `/api/cron/release-expired-holds` | `GET` | Sweeps the database for abandoned holds. Secured by `CRON_SECRET`. |
| `/api/cron/process-expired-offers` | `GET` | Cascades expired waitlist offers to the next user in line. |

## Quick Demo Guide
The database is pre-seeded. Try these flows instantly:
1. **Seat Locking**: Open `http://localhost:3000/shows/ssss1111-ssss-1111-ssss-1111ssss1111` in two browser windows. Select a seat in Window 1; watch it lock in Window 2 instantly.
2. **Waitlist Reallocation**: Event B (`ssss2222-...`) is 100% sold out with 4 mock users in the waitlist. Post a request to `/api/bookings/cancel` with the pre-seeded booking (`bbbb9999-...`) to watch the database instantly reassign the tickets and generate new claim links.
3. **Digital Pass**: Visit `/tickets/GS-DEMO-TEST` to view the Apple-Wallet style pass and test the PNG download.
4. **Organiser Dashboard**: Visit `/dashboard` to view the mock revenue breakdown and active event list.
