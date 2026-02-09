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

-- RLS
ALTER TABLE insight_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insight runs" ON insight_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insight artifacts" ON insight_artifacts
  FOR SELECT USING (
    run_id IN (SELECT id FROM insight_runs WHERE user_id = auth.uid())
  );
