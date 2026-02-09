import { SessionLog, AggregatedData } from '@/types';

/**
 * Aggregates session data into features for AI analysis
 * CRITICAL: No PII - excludes names, free-text reflections, raw session records
 */
export async function aggregateSessionsForInsight(
  sessions: SessionLog[],
  windowDays: number = 14
): Promise<AggregatedData> {
  if (sessions.length === 0) {
    throw new Error('No sessions available for aggregation');
  }

  // Sort sessions by date
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
  );

  const windowStart = sortedSessions[0].playedAt;
  const windowEnd = sortedSessions[sortedSessions.length - 1].playedAt;

  // Energy metrics
  const energyBefores = sessions.map((s) => s.energyBefore);
  const energyAfters = sessions.map((s) => s.energyAfter);
  const energyDeltas = sessions.map((s) => s.energyAfter - s.energyBefore);

  // Mood metrics
  const moodBefores = sessions.map((s) => s.moodBefore);
  const moodAfters = sessions.map((s) => s.moodAfter);
  const moodDeltas = sessions.map((s) => s.moodAfter - s.moodBefore);

  // Intensity distribution
  const intensityDistribution = {
    casual: sessions.filter((s) => s.intensity === 'casual').length,
    moderate: sessions.filter((s) => s.intensity === 'moderate').length,
    competitive: sessions.filter((s) => s.intensity === 'competitive').length,
  };

  // Format distribution
  const formatDistribution = {
    singles: sessions.filter((s) => s.format === 'singles').length,
    doubles: sessions.filter((s) => s.format === 'doubles').length,
  };

  // Environment distribution
  const environmentDistribution = {
    indoor: sessions.filter((s) => s.environment === 'indoor').length,
    outdoor: sessions.filter((s) => s.environment === 'outdoor').length,
  };

  // Soreness frequency
  const sorenessFrequency = {
    knees: computeSorenessDistribution(sessions, 'sorenessKnees'),
    shoulder: computeSorenessDistribution(sessions, 'sorenessShoulder'),
    back: computeSorenessDistribution(sessions, 'sorenessBack'),
  };

  // Mental tags frequency
  const mentalTagsFrequency: Record<string, number> = {};
  sessions.forEach((session) => {
    session.mentalTags.forEach((tag) => {
      mentalTagsFrequency[tag] = (mentalTagsFrequency[tag] || 0) + 1;
    });
  });

  // Format comparisons (energy/mood deltas by format)
  const singlesessions = sessions.filter((s) => s.format === 'singles');
  const doubleSessions = sessions.filter((s) => s.format === 'doubles');

  const formatComparisons = {
    singles: {
      count: singlesessions.length,
      avgEnergyDelta: singlesessions.length > 0 ? avg(singlesessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: singlesessions.length > 0 ? avg(singlesessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
    doubles: {
      count: doubleSessions.length,
      avgEnergyDelta: doubleSessions.length > 0 ? avg(doubleSessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: doubleSessions.length > 0 ? avg(doubleSessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
  };

  // Environment comparisons
  const indoorSessions = sessions.filter((s) => s.environment === 'indoor');
  const outdoorSessions = sessions.filter((s) => s.environment === 'outdoor');

  const environmentComparisons = {
    indoor: {
      count: indoorSessions.length,
      avgEnergyDelta: indoorSessions.length > 0 ? avg(indoorSessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: indoorSessions.length > 0 ? avg(indoorSessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
    outdoor: {
      count: outdoorSessions.length,
      avgEnergyDelta: outdoorSessions.length > 0 ? avg(outdoorSessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: outdoorSessions.length > 0 ? avg(outdoorSessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
  };

  // Intensity comparisons
  const casualSessions = sessions.filter((s) => s.intensity === 'casual');
  const moderateSessions = sessions.filter((s) => s.intensity === 'moderate');
  const competitiveSessions = sessions.filter((s) => s.intensity === 'competitive');

  const intensityComparisons = {
    casual: {
      count: casualSessions.length,
      avgEnergyDelta: casualSessions.length > 0 ? avg(casualSessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: casualSessions.length > 0 ? avg(casualSessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
    moderate: {
      count: moderateSessions.length,
      avgEnergyDelta: moderateSessions.length > 0 ? avg(moderateSessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: moderateSessions.length > 0 ? avg(moderateSessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
    competitive: {
      count: competitiveSessions.length,
      avgEnergyDelta: competitiveSessions.length > 0 ? avg(competitiveSessions.map((s) => s.energyAfter - s.energyBefore)) : 0,
      avgMoodDelta: competitiveSessions.length > 0 ? avg(competitiveSessions.map((s) => s.moodAfter - s.moodBefore)) : 0,
    },
  };

  return {
    sessionsCount: sessions.length,
    windowStart,
    windowEnd,
    windowDays,

    // Energy metrics
    avgEnergyBefore: avg(energyBefores),
    avgEnergyAfter: avg(energyAfters),
    energyDeltaAvg: avg(energyDeltas),
    energyDeltaMin: Math.min(...energyDeltas),
    energyDeltaMax: Math.max(...energyDeltas),

    // Mood metrics
    avgMoodBefore: avg(moodBefores),
    avgMoodAfter: avg(moodAfters),
    moodDeltaAvg: avg(moodDeltas),
    moodDeltaMin: Math.min(...moodDeltas),
    moodDeltaMax: Math.max(...moodDeltas),

    // Distributions
    intensityDistribution,
    formatDistribution,
    environmentDistribution,

    // Soreness
    sorenessFrequency,

    // Mental state
    mentalTagsFrequency,

    // Comparisons
    formatComparisons,
    environmentComparisons,
    intensityComparisons,

    // Duration stats (if available)
    avgDurationMinutes: sessions.filter(s => s.durationMinutes).length > 0
      ? avg(sessions.filter(s => s.durationMinutes).map(s => s.durationMinutes!))
      : undefined,
  };
}

/**
 * Compute soreness distribution for a specific body area
 */
function computeSorenessDistribution(
  sessions: SessionLog[],
  field: 'sorenessKnees' | 'sorenessShoulder' | 'sorenessBack'
): { none: number; low: number; moderate: number; high: number } {
  return {
    none: sessions.filter((s) => s[field] === 0).length,
    low: sessions.filter((s) => s[field] === 1).length,
    moderate: sessions.filter((s) => s[field] === 2).length,
    high: sessions.filter((s) => s[field] === 3).length,
  };
}

/**
 * Calculate average of an array of numbers
 */
function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.round((numbers.reduce((sum, n) => sum + n, 0) / numbers.length) * 100) / 100;
}
