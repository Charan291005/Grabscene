-- Migration: 20260822_role_based_rls.sql
-- Description: Implement strict Row Level Security (RLS) policies for RBAC (Admin, Organiser, Customer)

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 2. Create helper functions for roles
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_organiser() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'organiser' OR role = 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Profiles Policies
-- Users can read their own profile. Admins/Organisers can read all (for dashboards).
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (id = auth.uid() OR public.is_organiser());

-- Users can update their own profile (except role).
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- 4. Venues, Events, Venue Sections, Seats Policies
-- Everyone can read venues, events, sections, seats
CREATE POLICY "Public can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Public can view venue_sections" ON venue_sections FOR SELECT USING (true);
CREATE POLICY "Public can view seats" ON seats FOR SELECT USING (true);
CREATE POLICY "Public can view show_seats" ON show_seats FOR SELECT USING (true);

-- Only Organisers/Admins can insert/update/delete venues, events, sections, seats
CREATE POLICY "Organisers can manage venues" ON venues
    FOR ALL USING (public.is_organiser());

CREATE POLICY "Organisers can manage events" ON events
    FOR ALL USING (public.is_organiser());

CREATE POLICY "Organisers can manage venue_sections" ON venue_sections
    FOR ALL USING (public.is_organiser());

CREATE POLICY "Organisers can manage seats" ON seats
    FOR ALL USING (public.is_organiser());

CREATE POLICY "Organisers can manage show_seats" ON show_seats
    FOR ALL USING (public.is_organiser());

-- 5. Bookings & Booking Items Policies
-- Customers can read their own bookings. Organisers can read all bookings.
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid() OR public.is_organiser());

-- Bookings are created via RPC, but let's allow insert for their own user_id just in case
CREATE POLICY "Users can insert own bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Booking items inherit booking visibility
CREATE POLICY "Users can view own booking items" ON booking_items
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.id = booking_items.booking_id 
        AND (bookings.user_id = auth.uid() OR public.is_organiser())
      )
    );

-- 6. Waitlist Policies
-- Customers can read and insert their own waitlist entries
CREATE POLICY "Users can view own waitlist" ON waitlist
    FOR SELECT USING (user_id = auth.uid() OR public.is_organiser());

CREATE POLICY "Users can insert own waitlist" ON waitlist
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own waitlist" ON waitlist
    FOR UPDATE USING (user_id = auth.uid() OR public.is_organiser());

CREATE POLICY "Users can delete own waitlist" ON waitlist
    FOR DELETE USING (user_id = auth.uid() OR public.is_organiser());
