-- Migration: 20260823000001_add_event_image.sql
-- Description: Add image_url column to the events table

ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
