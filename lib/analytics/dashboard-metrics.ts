/**
 * Dashboard v1.1 - Deterministic Briefing Surface
 *
 * Core analytics module for computing dashboard metrics, comparisons, and notable shifts.
 * This module answers the question: "What has meaningfully changed recently?"
 */

import type { IntensityLevel, SessionFormat, SorenessLevel } from '@/types';
import type { LocalSessionLog } from '@/lib/db/local-db';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TimeWindow {
  startDate: Date;
  endDate: Date;
  label: string;
  sessionCount: number;
}

export interface WindowMetrics {
  sessionCount: number;
  sessions: LocalSessionLog[]; // Keep reference for sparklines, etc.

  // Energy metrics
  avgEnergyBefore: number;
  avgEnergyAfter: number;
  avgEnergyDelta: number;

  // Mood metrics
  avgMoodBefore: number;
  avgMoodAfter: number;
  avgMoodDelta: number;

  // Soreness frequency (% sessions with soreness != 0)
  sorenessFrequency: {
    hands: number;
    knees: number;
    shoulder: number;
    back: number;
  };

  // Session load
  avgDuration: number;

  // Distribution data (counts, not percentages)
  intensityDistribution: Record<IntensityLevel, number>;
  formatDistribution: Record<SessionFormat, number>;

  // Mental state (top 2-3 tags)
  topMentalTags: Array<{ tag: string; count: number }>;

  // Category breakdowns (for Context Comparisons)
  byFormat?: {
    singles: CategoryMetrics | null;
    doubles: CategoryMetrics | null;
  };
  byIntensity?: {
    casual: CategoryMetrics | null;
    moderate: CategoryMetrics | null;
    competitive: CategoryMetrics | null;
  };
}

export interface CategoryMetrics {
  count: number;
  avgEnergyDelta: number;
  avgSorenessFreq: number; // Combined across all areas
}

export interface MetricComparison {
  recent: number;
  baseline: number;
  delta: number;
  percentChange: number;
}

export interface WindowComparison {
  energy: {
    before: MetricComparison;
    after: MetricComparison;
    delta: MetricComparison;
  };
  mood: {
    before: MetricComparison;
    after: MetricComparison;
    delta: MetricComparison;
  };
  sorenessFrequency: {
    hands: MetricComparison;
    knees: MetricComparison;
    shoulder: MetricComparison;
    back: MetricComparison;
  };
  intensityShift: {
    casual: MetricComparison;
    moderate: MetricComparison;
    competitive: MetricComparison;
  };
  formatShift: {
    singles: MetricComparison;
    doubles: MetricComparison;
  };
}

export interface NotableShift {
  id: string;
  category: 'energy' | 'mood' | 'soreness' | 'intensity' | 'format';
  metric: string; // "Energy After", "Shoulder Soreness", etc.
  direction: 'increased' | 'decreased';
  magnitude: string; // "+0.6", "+18%", etc.
  magnitudeValue: number; // For sorting by importance
}

export interface DashboardData {
  windowConfig: {
    recent: TimeWindow;
    baseline: TimeWindow | null;
    daysBack: number;
    mode: 'standard' | 'dynamic-split' | 'insufficient-data';
  };
  recentMetrics: WindowMetrics;
  baselineMetrics: WindowMetrics | null;
  comparison: WindowComparison | null;
  notableShifts: NotableShift[];
  sampleSizeWarnings: {
    recentTooSmall: boolean;
    baselineTooSmall: boolean;
    categoryComparisonsUnsupported: boolean;
  };
  latestSessions: LocalSessionLog[]; // 1-3 most recent
}

// ============================================================================
// Thresholds Configuration
// ============================================================================

export interface ShiftThresholds {
  energyMoodAfter: number;
  energyMoodDelta: number;
  sorenessFrequency: number;
  distributionShift: number;
}

const DEFAULT_THRESHOLDS: ShiftThresholds = {
  energyMoodAfter: 0.4,    // |Δ avg_after| >= 0.4
  energyMoodDelta: 0.3,     // |Δ avg_delta| >= 0.3
  sorenessFrequency: 0.15,  // |Δ frequency| >= 15 percentage points
  distributionShift: 0.20,  // |Δ share| >= 20 percentage points
};

// ============================================================================
// Main Entry Point
// ============================================================================

export function getDashboardData(
  sessions: LocalSessionLog[],
  daysBack: 14 | 7 | 28 = 14,
  thresholds: ShiftThresholds = DEFAULT_THRESHOLDS
): DashboardData {
  const totalCount = sessions.length;

  // Case 1: Insufficient data (< 4 sessions)
  if (totalCount < 4) {
    return {
      windowConfig: {
        recent: {
          startDate: new Date(),
          endDate: new Date(),
          label: 'Recent',
          sessionCount: totalCount,
        },
        baseline: null,
        daysBack,
        mode: 'insufficient-data',
      },
      recentMetrics: computeWindowMetrics(sessions),
      baselineMetrics: null,
      comparison: null,
      notableShifts: [],
      sampleSizeWarnings: {
        recentTooSmall: true,
        baselineTooSmall: true,
        categoryComparisonsUnsupported: true,
      },
      latestSessions: sessions.slice(0, 3),
    };
  }

  // Calculate time windows
  const windows = calculateTimeWindows(sessions, daysBack);

  if (!windows) {
    // Shouldn't happen, but handle gracefully
    return getDashboardData(sessions, daysBack, thresholds);
  }

  const { recent, baseline, mode } = windows;

  // Compute metrics for each window
  const recentMetrics = computeWindowMetrics(recent.sessions);
  const baselineMetrics = baseline ? computeWindowMetrics(baseline.sessions) : null;

  // Compare windows
  const comparison = baselineMetrics ? compareWindows(recentMetrics, baselineMetrics) : null;

  // Detect notable shifts
  const notableShifts = comparison ? detectNotableShifts(comparison, thresholds) : [];

  // Sample size warnings
  const recentTooSmall = recent.sessionCount < 3;
  const baselineTooSmall = baseline ? baseline.sessionCount < 3 : true;
  const categoryComparisonsUnsupported =
    !recentMetrics.byFormat ||
    !recentMetrics.byFormat.singles ||
    !recentMetrics.byFormat.doubles ||
    recentMetrics.byFormat.singles.count < 3 ||
    recentMetrics.byFormat.doubles.count < 3;

  return {
    windowConfig: {
      recent: {
        startDate: recent.startDate,
        endDate: recent.endDate,
        label: recent.label,
        sessionCount: recent.sessionCount,
      },
      baseline: baseline ? {
        startDate: baseline.startDate,
        endDate: baseline.endDate,
        label: baseline.label,
        sessionCount: baseline.sessionCount,
      } : null,
      daysBack,
      mode,
    },
    recentMetrics,
    baselineMetrics,
    comparison,
    notableShifts,
    sampleSizeWarnings: {
      recentTooSmall,
      baselineTooSmall,
      categoryComparisonsUnsupported,
    },
    latestSessions: sessions.slice(0, 3),
  };
}

// ============================================================================
// Time Window Calculation
// ============================================================================

interface WindowData {
  startDate: Date;
  endDate: Date;
  label: string;
  sessions: LocalSessionLog[];
  sessionCount: number;
}

interface WindowPair {
  recent: WindowData;
  baseline: WindowData | null;
  mode: 'standard' | 'dynamic-split' | 'insufficient-data';
}

export function calculateTimeWindows(
  sessions: LocalSessionLog[],
  daysBack: 14 | 7 | 28 = 14
): WindowPair | null {
  const totalCount = sessions.length;

  // Sort sessions by playedAt (most recent first)
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  // Case 1: < 4 sessions total
  if (totalCount < 4) {
    return null;
  }

  const now = new Date();

  // Case 2: 4-9 sessions - use dynamic split
  if (totalCount < 10) {
    const splitIndex = Math.floor(totalCount / 2);
    const recentSessions = sortedSessions.slice(0, splitIndex);
    const baselineSessions = sortedSessions.slice(splitIndex);

    return {
      recent: {
        startDate: new Date(recentSessions[recentSessions.length - 1].playedAt),
        endDate: new Date(recentSessions[0].playedAt),
        label: 'Recent sessions',
        sessions: recentSessions,
        sessionCount: recentSessions.length,
      },
      baseline: {
        startDate: new Date(baselineSessions[baselineSessions.length - 1].playedAt),
        endDate: new Date(baselineSessions[0].playedAt),
        label: 'Previous sessions',
        sessions: baselineSessions,
        sessionCount: baselineSessions.length,
      },
      mode: 'dynamic-split',
    };
  }

  // Case 3: 10+ sessions - use standard time-based windowing
  const recentEnd = now;
  const recentStart = subDays(now, daysBack);
  const baselineEnd = recentStart;
  const baselineStart = subDays(baselineEnd, daysBack);

  const recentSessions = sortedSessions.filter(s => {
    const date = new Date(s.playedAt);
    return date >= recentStart && date <= recentEnd;
  });

  const baselineSessions = sortedSessions.filter(s => {
    const date = new Date(s.playedAt);
    return date >= baselineStart && date < baselineEnd;
  });

  // Validation: both windows need >= 3 sessions
  if (recentSessions.length < 3 || baselineSessions.length < 3) {
    // Fall back to dynamic split if time-based windowing doesn't yield enough data
    return calculateTimeWindows(sessions, daysBack);
  }

  return {
    recent: {
      startDate: recentStart,
      endDate: recentEnd,
      label: formatDateRange(recentStart, recentEnd),
      sessions: recentSessions,
      sessionCount: recentSessions.length,
    },
    baseline: {
      startDate: baselineStart,
      endDate: baselineEnd,
      label: formatDateRange(baselineStart, baselineEnd),
      sessions: baselineSessions,
      sessionCount: baselineSessions.length,
    },
    mode: 'standard',
  };
}

// ============================================================================
// Metrics Computation
// ============================================================================

export function computeWindowMetrics(sessions: LocalSessionLog[]): WindowMetrics {
  const count = sessions.length;

  if (count === 0) {
    // Return zeroed metrics
    return {
      sessionCount: 0,
      sessions: [],
      avgEnergyBefore: 0,
      avgEnergyAfter: 0,
      avgEnergyDelta: 0,
      avgMoodBefore: 0,
      avgMoodAfter: 0,
      avgMoodDelta: 0,
      sorenessFrequency: { hands: 0, knees: 0, shoulder: 0, back: 0 },
      avgDuration: 0,
      intensityDistribution: { casual: 0, moderate: 0, competitive: 0 },
      formatDistribution: { singles: 0, doubles: 0 },
      topMentalTags: [],
      byFormat: undefined,
      byIntensity: undefined,
    };
  }

  // Energy metrics
  const avgEnergyBefore = avg(sessions.map(s => s.energyBefore));
  const avgEnergyAfter = avg(sessions.map(s => s.energyAfter));
  const avgEnergyDelta = avg(sessions.map(s => s.energyAfter - s.energyBefore));

  // Mood metrics
  const avgMoodBefore = avg(sessions.map(s => s.moodBefore));
  const avgMoodAfter = avg(sessions.map(s => s.moodAfter));
  const avgMoodDelta = avg(sessions.map(s => s.moodAfter - s.moodBefore));

  // Soreness frequency (% sessions with soreness != 0)
  const sorenessFrequency = {
    hands: sessions.filter(s => s.sorenessHands > 0).length / count,
    knees: sessions.filter(s => s.sorenessKnees > 0).length / count,
    shoulder: sessions.filter(s => s.sorenessShoulder > 0).length / count,
    back: sessions.filter(s => s.sorenessBack > 0).length / count,
  };

  // Duration
  const sessionsWithDuration = sessions.filter(s => s.durationMinutes);
  const avgDuration = sessionsWithDuration.length > 0
    ? avg(sessionsWithDuration.map(s => s.durationMinutes!))
    : 0;

  // Distribution counts
  const intensityDistribution: Record<IntensityLevel, number> = {
    casual: sessions.filter(s => s.intensity === 'casual').length,
    moderate: sessions.filter(s => s.intensity === 'moderate').length,
    competitive: sessions.filter(s => s.intensity === 'competitive').length,
  };

  const formatDistribution: Record<SessionFormat, number> = {
    singles: sessions.filter(s => s.format === 'singles').length,
    doubles: sessions.filter(s => s.format === 'doubles').length,
  };

  // Mental tags (top 2-3)
  const mentalTagCounts: Record<string, number> = {};
  sessions.forEach(s => {
    s.mentalTags.forEach((tag: string) => {
      mentalTagCounts[tag] = (mentalTagCounts[tag] || 0) + 1;
    });
  });
  const topMentalTags = Object.entries(mentalTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag, count }));

  // Category breakdowns (only if sample size supports)
  const singlesSessions = sessions.filter(s => s.format === 'singles');
  const doublesSessions = sessions.filter(s => s.format === 'doubles');

  const byFormat = {
    singles: singlesSessions.length >= 3 ? computeCategoryMetrics(singlesSessions) : null,
    doubles: doublesSessions.length >= 3 ? computeCategoryMetrics(doublesSessions) : null,
  };

  const casualSessions = sessions.filter(s => s.intensity === 'casual');
  const moderateSessions = sessions.filter(s => s.intensity === 'moderate');
  const competitiveSessions = sessions.filter(s => s.intensity === 'competitive');

  const byIntensity = {
    casual: casualSessions.length >= 3 ? computeCategoryMetrics(casualSessions) : null,
    moderate: moderateSessions.length >= 3 ? computeCategoryMetrics(moderateSessions) : null,
    competitive: competitiveSessions.length >= 3 ? computeCategoryMetrics(competitiveSessions) : null,
  };

  return {
    sessionCount: count,
    sessions,
    avgEnergyBefore,
    avgEnergyAfter,
    avgEnergyDelta,
    avgMoodBefore,
    avgMoodAfter,
    avgMoodDelta,
    sorenessFrequency,
    avgDuration,
    intensityDistribution,
    formatDistribution,
    topMentalTags,
    byFormat,
    byIntensity,
  };
}

function computeCategoryMetrics(sessions: LocalSessionLog[]): CategoryMetrics {
  const avgEnergyDelta = avg(sessions.map(s => s.energyAfter - s.energyBefore));

  // Combined soreness frequency across all areas
  const totalSoreness = sessions.reduce((sum, s) => {
    const hasSoreness = s.sorenessHands > 0 || s.sorenessKnees > 0 ||
                        s.sorenessShoulder > 0 || s.sorenessBack > 0;
    return sum + (hasSoreness ? 1 : 0);
  }, 0);
  const avgSorenessFreq = totalSoreness / sessions.length;

  return {
    count: sessions.length,
    avgEnergyDelta,
    avgSorenessFreq,
  };
}

// ============================================================================
// Window Comparison
// ============================================================================

export function compareWindows(
  recent: WindowMetrics,
  baseline: WindowMetrics
): WindowComparison {
  return {
    energy: {
      before: compareMetric(recent.avgEnergyBefore, baseline.avgEnergyBefore),
      after: compareMetric(recent.avgEnergyAfter, baseline.avgEnergyAfter),
      delta: compareMetric(recent.avgEnergyDelta, baseline.avgEnergyDelta),
    },
    mood: {
      before: compareMetric(recent.avgMoodBefore, baseline.avgMoodBefore),
      after: compareMetric(recent.avgMoodAfter, baseline.avgMoodAfter),
      delta: compareMetric(recent.avgMoodDelta, baseline.avgMoodDelta),
    },
    sorenessFrequency: {
      hands: compareMetric(recent.sorenessFrequency.hands, baseline.sorenessFrequency.hands),
      knees: compareMetric(recent.sorenessFrequency.knees, baseline.sorenessFrequency.knees),
      shoulder: compareMetric(recent.sorenessFrequency.shoulder, baseline.sorenessFrequency.shoulder),
      back: compareMetric(recent.sorenessFrequency.back, baseline.sorenessFrequency.back),
    },
    intensityShift: {
      casual: compareDistribution(
        recent.intensityDistribution.casual,
        recent.sessionCount,
        baseline.intensityDistribution.casual,
        baseline.sessionCount
      ),
      moderate: compareDistribution(
        recent.intensityDistribution.moderate,
        recent.sessionCount,
        baseline.intensityDistribution.moderate,
        baseline.sessionCount
      ),
      competitive: compareDistribution(
        recent.intensityDistribution.competitive,
        recent.sessionCount,
        baseline.intensityDistribution.competitive,
        baseline.sessionCount
      ),
    },
    formatShift: {
      singles: compareDistribution(
        recent.formatDistribution.singles,
        recent.sessionCount,
        baseline.formatDistribution.singles,
        baseline.sessionCount
      ),
      doubles: compareDistribution(
        recent.formatDistribution.doubles,
        recent.sessionCount,
        baseline.formatDistribution.doubles,
        baseline.sessionCount
      ),
    },
  };
}

function compareMetric(recent: number, baseline: number): MetricComparison {
  const delta = recent - baseline;
  const percentChange = baseline !== 0 ? (delta / Math.abs(baseline)) * 100 : 0;

  return {
    recent: round2(recent),
    baseline: round2(baseline),
    delta: round2(delta),
    percentChange: round2(percentChange),
  };
}

function compareDistribution(
  recentCount: number,
  recentTotal: number,
  baselineCount: number,
  baselineTotal: number
): MetricComparison {
  const recentPct = recentTotal > 0 ? recentCount / recentTotal : 0;
  const baselinePct = baselineTotal > 0 ? baselineCount / baselineTotal : 0;
  const delta = recentPct - baselinePct; // Percentage point change
  const percentChange = baselinePct !== 0 ? (delta / baselinePct) * 100 : 0;

  return {
    recent: round2(recentPct),
    baseline: round2(baselinePct),
    delta: round2(delta),
    percentChange: round2(percentChange),
  };
}

// ============================================================================
// Notable Shifts Detection
// ============================================================================

export function detectNotableShifts(
  comparison: WindowComparison,
  thresholds: ShiftThresholds = DEFAULT_THRESHOLDS
): NotableShift[] {
  const shifts: NotableShift[] = [];

  // Energy shifts
  if (Math.abs(comparison.energy.after.delta) >= thresholds.energyMoodAfter) {
    shifts.push({
      id: 'energy-after',
      category: 'energy',
      metric: 'Post-session energy',
      direction: comparison.energy.after.delta > 0 ? 'increased' : 'decreased',
      magnitude: formatDelta(comparison.energy.after.delta, 'decimal'),
      magnitudeValue: Math.abs(comparison.energy.after.delta),
    });
  }

  if (Math.abs(comparison.energy.delta.delta) >= thresholds.energyMoodDelta) {
    shifts.push({
      id: 'energy-delta',
      category: 'energy',
      metric: 'Energy response',
      direction: comparison.energy.delta.delta > 0 ? 'increased' : 'decreased',
      magnitude: formatDelta(comparison.energy.delta.delta, 'decimal'),
      magnitudeValue: Math.abs(comparison.energy.delta.delta),
    });
  }

  // Mood shifts
  if (Math.abs(comparison.mood.after.delta) >= thresholds.energyMoodAfter) {
    shifts.push({
      id: 'mood-after',
      category: 'mood',
      metric: 'Post-session mood',
      direction: comparison.mood.after.delta > 0 ? 'increased' : 'decreased',
      magnitude: formatDelta(comparison.mood.after.delta, 'decimal'),
      magnitudeValue: Math.abs(comparison.mood.after.delta),
    });
  }

  if (Math.abs(comparison.mood.delta.delta) >= thresholds.energyMoodDelta) {
    shifts.push({
      id: 'mood-delta',
      category: 'mood',
      metric: 'Mood response',
      direction: comparison.mood.delta.delta > 0 ? 'increased' : 'decreased',
      magnitude: formatDelta(comparison.mood.delta.delta, 'decimal'),
      magnitudeValue: Math.abs(comparison.mood.delta.delta),
    });
  }

  // Soreness frequency shifts
  const sorenessAreas: Array<{ key: keyof typeof comparison.sorenessFrequency; label: string }> = [
    { key: 'hands', label: 'Hands soreness frequency' },
    { key: 'knees', label: 'Knees soreness frequency' },
    { key: 'shoulder', label: 'Shoulder soreness frequency' },
    { key: 'back', label: 'Back soreness frequency' },
  ];

  sorenessAreas.forEach(({ key, label }) => {
    const delta = comparison.sorenessFrequency[key].delta;
    if (Math.abs(delta) >= thresholds.sorenessFrequency) {
      shifts.push({
        id: `soreness-${key}`,
        category: 'soreness',
        metric: label,
        direction: delta > 0 ? 'increased' : 'decreased',
        magnitude: formatDelta(delta, 'percentage'),
        magnitudeValue: Math.abs(delta),
      });
    }
  });

  // Intensity distribution shifts
  const intensityLevels: Array<{ key: keyof typeof comparison.intensityShift; label: string }> = [
    { key: 'casual', label: 'Casual sessions' },
    { key: 'moderate', label: 'Moderate sessions' },
    { key: 'competitive', label: 'Competitive sessions' },
  ];

  intensityLevels.forEach(({ key, label }) => {
    const delta = comparison.intensityShift[key].delta;
    if (Math.abs(delta) >= thresholds.distributionShift) {
      shifts.push({
        id: `intensity-${key}`,
        category: 'intensity',
        metric: label,
        direction: delta > 0 ? 'increased' : 'decreased',
        magnitude: formatDelta(delta, 'percentage'),
        magnitudeValue: Math.abs(delta),
      });
    }
  });

  // Format distribution shifts
  const formatTypes: Array<{ key: keyof typeof comparison.formatShift; label: string }> = [
    { key: 'singles', label: 'Singles sessions' },
    { key: 'doubles', label: 'Doubles sessions' },
  ];

  formatTypes.forEach(({ key, label }) => {
    const delta = comparison.formatShift[key].delta;
    if (Math.abs(delta) >= thresholds.distributionShift) {
      shifts.push({
        id: `format-${key}`,
        category: 'format',
        metric: label,
        direction: delta > 0 ? 'increased' : 'decreased',
        magnitude: formatDelta(delta, 'percentage'),
        magnitudeValue: Math.abs(delta),
      });
    }
  });

  // Rank by magnitude and return top 3-4
  const ranked = shifts.sort((a, b) => b.magnitudeValue - a.magnitudeValue);

  // Return top 4 if 4th place is tied, otherwise top 3
  if (ranked.length > 4 && ranked[3].magnitudeValue === ranked[4].magnitudeValue) {
    return ranked.slice(0, 4);
  }

  return ranked.slice(0, Math.min(4, ranked.length));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate average of an array of numbers, ignoring NaN values
 */
function avg(numbers: number[]): number {
  const valid = numbers.filter(n => !isNaN(n) && isFinite(n));
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, n) => acc + n, 0);
  return sum / valid.length;
}

/**
 * Round to 2 decimal places
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Subtract days from a date
 */
function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Format date range as "Feb 1 - Feb 14"
 */
function formatDateRange(start: Date, end: Date): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = monthNames[start.getMonth()];
  const startDay = start.getDate();
  const endMonth = monthNames[end.getMonth()];
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * Format delta for display
 */
function formatDelta(delta: number, type: 'decimal' | 'percentage'): string {
  const sign = delta > 0 ? '+' : '';

  if (type === 'percentage') {
    // Convert to percentage points
    return `${sign}${Math.round(delta * 100)}%`;
  }

  // Decimal format
  return `${sign}${round2(delta)}`;
}
