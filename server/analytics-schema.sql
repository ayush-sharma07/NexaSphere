-- Analytics Schema Extension
-- Add tables for real-time event registration tracking and analytics

-- Registrations table for tracking event attendees
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id text,
  email text NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'registered', -- 'registered', 'checked_in', 'cancelled', 'no_show'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON registrations(event_id, status);

-- Update events table to include capacity tracking
ALTER TABLE events
ADD COLUMN IF NOT EXISTS max_attendees integer,
ADD COLUMN IF NOT EXISTS capacity_type text DEFAULT 'unlimited'; -- 'limited', 'unlimited'

-- Create indexes on events for analytics queries
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_updated_at ON events(updated_at DESC);

-- Analytics view for quick metrics
CREATE OR REPLACE VIEW event_analytics AS
SELECT
  e.id,
  e.name,
  e.short_name,
  e.date_text,
  e.status,
  e.max_attendees,
  COUNT(DISTINCT r.id) as total_registrations,
  COUNT(DISTINCT CASE WHEN r.status = 'checked_in' THEN r.id END) as checked_in_count,
  COUNT(DISTINCT CASE WHEN r.status = 'registered' THEN r.id END) as registered_count,
  COUNT(DISTINCT CASE WHEN r.status = 'cancelled' THEN r.id END) as cancelled_count,
  COUNT(DISTINCT CASE WHEN r.status = 'no_show' THEN r.id END) as no_show_count,
  e.created_at,
  e.updated_at
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id, e.name, e.short_name, e.date_text, e.status, e.max_attendees, e.created_at, e.updated_at;
