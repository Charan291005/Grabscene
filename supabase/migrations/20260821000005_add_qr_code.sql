-- Migration: 20260821_add_qr_code.sql
-- Description: Add qr_code_url to bookings table.

ALTER TABLE bookings ADD COLUMN qr_code_url TEXT;
