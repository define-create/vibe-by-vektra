// AI Insights Quota Configuration
// All values are parameterized for easy adjustment

export const INSIGHT_QUOTAS = {
  // Guest user limits (unauthenticated)
  GUEST_MAX_TOTAL: 1, // Total insights a guest can generate (per device)

  // Logged-in user limits
  DAILY_LIMIT: 3, // Max insights per day (UTC-based)
  MONTHLY_LIMIT: 30, // Max insights per calendar month
  COOLDOWN_MINUTES: 10, // Minimum minutes between insight runs
  MAX_REGENERATIONS: 2, // Max regenerations per InsightRun

  // Default analysis window
  DEFAULT_WINDOW_DAYS: 14, // Default lookback period for insights
  WINDOW_OPTIONS: [7, 14, 30] // Available window day options
} as const;

// Minimum session count for generating insights
export const MIN_SESSIONS_FOR_INSIGHTS = 1; // Allow insights with at least 1 session

// Pro tier quotas (preview only in v1.1, not enforced)
export const PRO_QUOTAS = {
  DAILY_LIMIT: 10,
  MONTHLY_LIMIT: 100,
  COOLDOWN_MINUTES: 5,
  MAX_REGENERATIONS: 5
} as const;
