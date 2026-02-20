/**
 * Rule-Based Insight Generator
 * Deterministic, explainable insights without AI
 * Week 2 feature: consistency-focused analysis
 */

import type { LocalSessionLog } from '@/lib/db/local-db';

// ============================================================================
// Type Definitions
// ============================================================================

export type DeltaDirection = 'up' | 'down' | 'flat';
export type InsightType = 'evidence' | 'callout' | 'guidance';

export interface ChartPoint {
  x: string; // Date label (e.g., "02-10")
  y: number; // Metric value
}

export interface ChartSeries {
  name: string;
  points: ChartPoint[];
}

export interface InsightTimelineItem {
  id: string;
  variant: InsightType;
  timestampLabel: string;
  title?: string;
  body: string;
  series?: ChartSeries[];
}

export interface ThesisData {
  title: string; // 1-2 sentence thesis
  metricLabel: string; // "Consistency"
  metricValue: string; // "+18%"
  metricDelta?: DeltaDirection;
  context: string; // "Based on Jan 10–Feb 13"
}

export interface GeneratedInsight {
  thesis: ThesisData;
  timeline: InsightTimelineItem[]; // Minimum 3 blocks
  actions: Array<{
    id: string;
    label: string;
    hint?: string;
  }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function sortByDateAsc(sessions: LocalSessionLog[]): LocalSessionLog[] {
  return [...sessions].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
}

function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, arr.length - n));
}

function formatDateRange(startISO: string, endISO: string): string {
  // Simple format: "Feb 01 – Feb 14"
  const start = new Date(startISO);
  const end = new Date(endISO);

  const formatDate = (d: Date) => {
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    return `${month} ${day}`;
  };

  return `${formatDate(start)} – ${formatDate(end)}`;
}

function countSessionsInLastDays(
  sessions: LocalSessionLog[],
  days: number
): number {
  if (!sessions.length) return 0;

  const end = new Date(sessions[sessions.length - 1].playedAt);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);

  return sessions.filter((s) => {
    const d = new Date(s.playedAt);
    return d >= start && d <= end;
  }).length;
}

function avg(nums: number[]): number | null {
  const v = nums.filter((n) => Number.isFinite(n));
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function directionFromDelta(delta: number, eps = 1e-6): DeltaDirection {
  if (delta > eps) return 'up';
  if (delta < -eps) return 'down';
  return 'flat';
}

function sorenessCount(s: LocalSessionLog): number {
  return (s.sorenessKnees || 0) + (s.sorenessShoulder || 0) + (s.sorenessBack || 0);
}

// ============================================================================
// Main Generator Function
// ============================================================================

export function generateInsights(sessionsRaw: LocalSessionLog[]): GeneratedInsight {
  const sessions = sortByDateAsc(sessionsRaw);

  // Empty state: < 3 sessions
  const empty: GeneratedInsight = {
    thesis: {
      title: 'Log a few sessions to unlock insights.',
      metricLabel: 'Progress',
      metricValue: '—',
      context: 'Add at least 3 sessions.',
    },
    timeline: [
      {
        id: 'empty-evidence',
        variant: 'evidence',
        timestampLabel: 'Getting started',
        title: 'No trend yet',
        body: 'Once you have a few sessions, Vibe will summarize changes and suggest next steps.',
      },
      {
        id: 'empty-callout',
        variant: 'callout',
        timestampLabel: 'Why it matters',
        title: 'Consistency beats intensity',
        body: 'A steady routine is usually the fastest way to improve outcomes over time.',
      },
      {
        id: 'empty-guidance',
        variant: 'guidance',
        timestampLabel: 'Next',
        title: 'Log your next session',
        body: 'Record mood, energy, soreness, and a short note. Your first insights will appear soon.',
      },
    ],
    actions: [
      {
        id: 'action-add',
        label: 'Add a session',
        hint: 'Start logging to unlock trends.',
      },
    ],
  };

  if (sessions.length < 3) return empty;

  // Date range for context
  const endISO = sessions[sessions.length - 1].playedAt;
  const startISO = sessions[0].playedAt;
  const context = formatDateRange(startISO, endISO);

  // ============================================================================
  // Consistency Analysis: sessions in last 14 days vs previous 14 days
  // ============================================================================

  const last14 = countSessionsInLastDays(sessions, 14);

  // Compute previous 14-day window count
  const end = new Date(endISO);
  const mid = new Date(end);
  mid.setUTCDate(mid.getUTCDate() - 14);

  const prevWindowSessions = sessions.filter((s) => {
    const d = new Date(s.playedAt);
    return d < mid;
  });

  const prev14 = prevWindowSessions.length
    ? countSessionsInLastDays(prevWindowSessions, 14)
    : Math.max(0, last14 - 1); // Fallback

  const deltaCount = last14 - prev14;
  const deltaDir = directionFromDelta(deltaCount);

  // ============================================================================
  // Rolling 7-day window chart series
  // ============================================================================

  const recent = lastN(sessions, 10);
  const rolling: ChartPoint[] = recent.map((s) => {
    const subset = sessions.slice(0, sessions.indexOf(s) + 1);
    const value = countSessionsInLastDays(subset, 7);
    const date = new Date(s.playedAt);
    const label = `${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return { x: label, y: value };
  });

  // ============================================================================
  // Secondary signals: mood stability + soreness
  // ============================================================================

  const last5 = lastN(sessions, 5);
  const prev5 =
    sessions.length >= 10
      ? sessions.slice(sessions.length - 10, sessions.length - 5)
      : sessions.slice(0, Math.max(0, sessions.length - 5));

  const moodLast = avg(last5.map((s) => s.moodAfter ?? NaN));
  const moodPrev = avg(prev5.map((s) => s.moodAfter ?? NaN));
  const moodDelta =
    moodLast != null && moodPrev != null ? moodLast - moodPrev : null;

  const soreLast = avg(last5.map((s) => sorenessCount(s)));
  const sorePrev = avg(prev5.map((s) => sorenessCount(s)));
  const soreDelta =
    soreLast != null && sorePrev != null ? soreLast - sorePrev : null;

  // ============================================================================
  // Thesis metric: % change in 14-day consistency
  // ============================================================================

  const base = Math.max(1, prev14);
  const pct = Math.round(((last14 - prev14) / base) * 100);
  const pctLabel = pct >= 0 ? `+${pct}%` : `${pct}%`;

  const thesisTitle =
    deltaDir === 'up'
      ? 'Consistency improved over the last 2 weeks.'
      : deltaDir === 'down'
      ? 'Consistency dipped over the last 2 weeks.'
      : 'Consistency held steady over the last 2 weeks.';

  // ============================================================================
  // Interpretation (callout block)
  // ============================================================================

  const interpretation = (() => {
    const parts: string[] = [];

    if (moodDelta != null) {
      if (moodDelta > 0.15)
        parts.push('Mood scores improved alongside the higher frequency.');
      else if (moodDelta < -0.15)
        parts.push('Mood scores declined slightly even as frequency changed.');
      else parts.push('Mood scores stayed relatively stable during this period.');
    }

    if (soreDelta != null) {
      if (soreDelta > 0.25)
        parts.push(
          'Soreness signals increased—consider recovery before adding more volume.'
        );
      else if (soreDelta < -0.25)
        parts.push(
          'Soreness signals eased—your current pacing appears sustainable.'
        );
      else parts.push('Soreness signals stayed stable.');
    }

    if (!parts.length) {
      return 'Your recent sessions show a meaningful pattern, but some fields are missing. Keep logging mood/energy/soreness for stronger insights.';
    }

    return parts.join(' ');
  })();

  // ============================================================================
  // Guidance (action block)
  // ============================================================================

  const guidance = (() => {
    if (deltaDir === 'up') {
      if (soreDelta != null && soreDelta > 0.25) {
        return 'Maintain 3–4 sessions/week, but reduce intensity on the next session or add a recovery note if soreness persists.';
      }
      return 'Keep your current frequency for the next 2 weeks. If you feel soreness rising, adjust intensity before reducing consistency.';
    }

    if (deltaDir === 'down') {
      return 'Try scheduling 2 sessions this week at a consistent time of day. Consistency matters more than pushing intensity.';
    }

    return 'Stay at your current cadence. If you want faster progress, add one low-intensity session this week and watch soreness.';
  })();

  // ============================================================================
  // Build timeline (3 blocks minimum)
  // ============================================================================

  const timeline: InsightTimelineItem[] = [
    {
      id: 'evidence-consistency',
      variant: 'evidence',
      timestampLabel: 'Last 2 weeks',
      title: 'Session frequency changed',
      body: `You logged ${last14} sessions in the last 14 days (previous 14 days: ${prev14}).`,
      series: [{ name: 'Sessions / 7 days', points: rolling }],
    },
    {
      id: 'callout-meaning',
      variant: 'callout',
      timestampLabel: 'Why it matters',
      title: 'Interpretation',
      body: interpretation,
    },
    {
      id: 'guidance-next',
      variant: 'guidance',
      timestampLabel: 'What to do next',
      title: 'Recommendation',
      body: guidance,
    },
  ];

  // ============================================================================
  // Action items
  // ============================================================================

  const actions = [
    {
      id: 'action-set-goal',
      label: 'Set a weekly consistency target',
      hint: 'Start with 3–4/week.',
    },
    {
      id: 'action-adjust-intensity',
      label: 'Adjust intensity next session',
      hint: 'Reduce intensity if soreness rises.',
    },
    {
      id: 'action-add-note',
      label: 'Add a short note after sessions',
      hint: 'It improves interpretation quality.',
    },
  ];

  // ============================================================================
  // Return complete insight
  // ============================================================================

  return {
    thesis: {
      title: thesisTitle,
      metricLabel: 'Consistency',
      metricValue: pctLabel,
      metricDelta: deltaDir,
      context: `Based on ${context}`,
    },
    timeline,
    actions,
  };
}
