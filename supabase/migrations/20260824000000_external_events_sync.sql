-- Migration: 20260824000000_external_events_sync.sql
-- Description: Add external_id to events and shows tables for idempotent API sync

ALTER TABLE events ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE;
ALTER TABLE shows ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE;
