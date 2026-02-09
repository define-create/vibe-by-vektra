-- ============================================
-- Vibe by Vektra - Database Schema
-- Combined migrations for easy deployment
-- ============================================

-- Migration 001: Initial Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Session Logs
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Mood & Energy (1-5 scale)
  energy_before SMALLINT NOT NULL CHECK (energy_before BETWEEN 1 AND 5),
  energy_after SMALLINT NOT NULL CHECK (energy_after BETWEEN 1 AND 5),
  mood_before SMALLINT NOT NULL CHECK (mood_before BETWEEN 1 AND 5),
  mood_after SMALLINT NOT NULL CHECK (mood_after BETWEEN 1 AND 5),

  -- Soreness (0=none, 1=low, 2=moderate, 3=high)
  soreness_knees SMALLINT NOT NULL DEFAULT 0 CHECK (soreness_knees BETWEEN 0 AND 3),
  soreness_shoulder SMALLINT NOT NULL DEFAULT 0 CHECK (soreness_shoulder BETWEEN 0 AND 3),
  soreness_back SMALLINT NOT NULL DEFAULT 0 CHECK (soreness_back BETWEEN 0 AND 3),

  -- Session context
  intensity TEXT NOT NULL CHECK (intensity IN ('casual', 'moderate', 'competitive')),
  format TEXT NOT NULL CHECK (format IN ('singles', 'doubles')),
  environment TEXT NOT NULL CHECK (environment IN ('indoor', 'outdoor')),
  duration_minutes INTEGER,

  -- Optional metadata
  mental_tags TEXT[] DEFAULT '{}',
  free_text_reflection TEXT,
  people_ids_played_with UUID[] DEFAULT '{}',
  people_ids_played_against UUID[] DEFAULT '{}'
);

CREATE INDEX idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX idx_session_logs_played_at ON session_logs(played_at DESC);

-- People Directory
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_preference TEXT CHECK (role_preference IN ('partner', 'opponent', 'both')),
  rating SMALLINT CHECK (rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_people_user_id ON people(user_id);

-- Supporting Inputs Catalog
CREATE TABLE supporting_inputs_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  seeded_preloaded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supporting_inputs_user_id ON supporting_inputs_catalog(user_id);

-- Supporting Inputs Per Session (junction table)
CREATE TABLE supporting_inputs_per_session (
  session_id UUID NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  input_id UUID NOT NULL REFERENCES supporting_inputs_catalog(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (session_id, input_id)
);

-- RLS Policies for Initial Schema
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporting_inputs_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporting_inputs_per_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own session logs" ON session_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own people" ON people
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own supporting inputs" ON supporting_inputs_catalog
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own session inputs" ON supporting_inputs_per_session
  FOR ALL USING (
    session_id IN (SELECT id FROM session_logs WHERE user_id = auth.uid())
  );


-- Migration 002: Insights Tables
-- ============================================

-- Insight Runs
CREATE TABLE insight_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  sessions_count INTEGER NOT NULL,
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  regeneration_count SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_insight_runs_user_id ON insight_runs(user_id, created_at DESC);

-- Insight Artifacts (individual observations)
CREATE TABLE insight_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES insight_runs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  observation_text TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  evidence_summary TEXT,
  metrics JSONB
);

CREATE INDEX idx_insight_artifacts_run_id ON insight_artifacts(run_id);

-- RLS for Insights
ALTER TABLE insight_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insight runs" ON insight_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insight artifacts" ON insight_artifacts
  FOR SELECT USING (
    run_id IN (SELECT id FROM insight_runs WHERE user_id = auth.uid())
  );


-- Migration 003: Guest Insight Allowance
-- ============================================

-- Guest Insight Allowance (server-side enforcement)
CREATE TABLE guest_insight_allowance (
  anon_id TEXT PRIMARY KEY,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent_hash TEXT,
  ip_hash TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guest_allowance_consumed ON guest_insight_allowance(consumed_at);

-- No RLS - accessed server-side only via service role key
