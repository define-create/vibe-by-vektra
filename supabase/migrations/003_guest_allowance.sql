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
