# GrabScene - Advanced Event Ticketing Engine

GrabScene is a robust, concurrent event ticketing platform built with Next.js and Supabase. It strictly adheres to modern system design principles, offering real-time seat maps, concurrency-protected checkouts, and an automated waitlist cascade.

## 🚀 Hosted Application

**Live URL:** [https://grabscene-rho.vercel.app](https://grabscene-rho.vercel.app) *(or whichever standard Vercel URL was generated)*

### Judge Evaluation (1-Click Logins)
To bypass registration and easily evaluate the Role-Based Access Control (RBAC):
1. Navigate to `/auth/login`
2. Click **Login as Demo Admin**, **Login as Demo Organiser**, or **Login as Demo Customer** in the Judge Evaluation panel.
3. You will be instantly logged in to test features restricted to those roles.

---

## 🛠️ Setup Guide

### 1. Prerequisites
- Node.js 18+
- Supabase CLI installed (`npm install -g supabase`)
- A Supabase project (Free tier works perfectly)

### 2. Environment Variables
Copy the example file and fill in your keys:
```bash
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Database Initialization
Link to your Supabase project and push the schema:
```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

*Note: The migrations include seed data. Run `npx supabase db reset` if you want to apply the seed script.*

### 4. Run the Application
Install dependencies and start the Next.js development server:
```bash
npm install
npm run dev
```
Access the app at `http://localhost:3000`.

---

## 🏗️ Database Schema Overview

The Postgres schema leverages Row-Level Security (RLS) to separate Admin, Organiser, and Customer access:

- **`profiles`**: Tied to `auth.users`, dictates role (`admin`, `organiser`, `customer`).
- **`venues` & `venue_sections`**: Managed exclusively by `admin`. Represents the physical building and category zones.
- **`seats`**: The static, physical seats mapping inside a venue.
- **`events` & `shows`**: Managed by `organiser`. Represents the marketing entity and specific timed occurrences at a venue.
- **`show_seats`**: The dynamic bridge between a `show` and a `seat`. Tracks real-time status (`available`, `held`, `booked`).
- **`bookings` & `booking_items`**: Finalized orders mapped to users and seats.
- **`waitlist`**: Queues users for specific shows and venue categories.

---

## ⚙️ Core Logic

### Seat Holds (TTL)
When a customer selects a seat, the system issues a hold via the `hold_seats` Postgres RPC. This function:
1. Executes `SELECT ... FOR UPDATE` to lock the rows.
2. Checks if the seats are still `available`.
3. If yes, updates the status to `held` and sets a `hold_expires_at` timestamp (TTL = 10 minutes).
4. If the TTL expires, a database function or cron job (`release_expired_holds`) cascades them back to `available`.

### Waitlist Cascade
When a booking is cancelled via `cancel_booking_and_reallocate`:
1. The cancelled seats are flagged.
2. The RPC immediately checks the `waitlist` table for the oldest user waiting for that specific category.
3. If a match is found, the seat status changes to `offered` to that waitlisted user.
4. An automated email is dispatched with a time-limited magic link to claim the seat.

---

## 📡 API Documentation

### `POST /api/events/create`
**Role Required**: `organiser`
Creates a new event and instances a show.
- **Body**: `{ title, description, venue_id, date, time, pricing: { VIP, Standard }, image_url }`
- **Response**: `{ success: true, eventId, showId }`

### `POST /api/bookings/confirm`
**Role Required**: `customer` (must own the hold)
Confirms a held booking, charges payment, and dispatches the QR Code email.
- **Body**: `{ showId, seatIds, userId, userEmail }`
- **Response**: `{ success: true, bookingId }`
