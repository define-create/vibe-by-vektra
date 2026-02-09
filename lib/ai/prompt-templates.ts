import { AggregatedData } from '@/types';

/**
 * System prompt for AI insights generation
 * Enforces observational tone, no coaching language
 */
export const INSIGHT_SYSTEM_PROMPT = `You are an analytical assistant for Vibe, a private reflection tool for physical activity sessions. Your role is to identify observational patterns in structured session data.

CRITICAL CONSTRAINTS:
- Be purely observational. Report correlations, associations, and trends only.
- NEVER use prescriptive language: no "should", "try", "recommend", "you need to", "consider", "might want to".
- NEVER provide medical advice or diagnoses.
- Do not invent data. Only discuss patterns present in the provided aggregates.
- Tone: calm, concise, metric-grounded, matter-of-fact.
- Focus on durable patterns, not one-off anomalies.

OUTPUT FORMAT:
Return 3-7 distinct insights as a JSON array. Each insight must have:
{
  "title": "Brief observation (5-8 words)",
  "observation_text": "1-2 sentence observation with specific metrics",
  "confidence": "low" | "medium" | "high",
  "evidence_summary": "Brief supporting data (1 sentence)",
  "metrics": { relevant aggregate values as key-value pairs }
}

CONFIDENCE HEURISTIC:
- High: 10+ sessions, consistent pattern (>80% frequency or strong correlation)
- Medium: 5-9 sessions, noticeable pattern (>60% frequency)
- Low: <5 sessions or weak/inconsistent pattern

EXAMPLE GOOD INSIGHTS:
✓ "Energy increases more in doubles format" - "Across 12 sessions, doubles play showed +1.8 average energy delta vs +0.9 in singles."
✓ "Knee soreness appears in competitive sessions" - "7 of 8 competitive sessions logged moderate-to-high knee soreness, compared to 1 of 10 casual sessions."
✓ "Flow state correlates with positive mood change" - "Sessions tagged with 'flow-state' (n=6) averaged +2.3 mood delta vs +0.8 overall."

EXAMPLE BAD INSIGHTS (DO NOT EMULATE):
✗ "You should try more doubles play to boost energy" (prescriptive)
✗ "Consider reducing competitive intensity to protect your knees" (coaching)
✗ "This might indicate overtraining" (medical advice)
✗ "Your energy is low" (not pattern-focused, no context)

Remember: Observe and report patterns. Never advise or prescribe.`;

/**
 * Build user prompt from aggregated data
 */
export function buildInsightPrompt(data: AggregatedData): string {
  return `Analyze the following ${data.sessionsCount} sessions from ${formatDate(data.windowStart)} to ${formatDate(data.windowEnd)} (${data.windowDays}-day window):

## Session Overview
- Total sessions: ${data.sessionsCount}
- Time period: ${data.windowDays} days

## Energy Patterns
- Average energy before: ${data.avgEnergyBefore}/5
- Average energy after: ${data.avgEnergyAfter}/5
- Average energy change: ${formatDelta(data.energyDeltaAvg)}
- Energy change range: ${formatDelta(data.energyDeltaMin)} to ${formatDelta(data.energyDeltaMax)}

## Mood Patterns
- Average mood before: ${data.avgMoodBefore}/5
- Average mood after: ${data.avgMoodAfter}/5
- Average mood change: ${formatDelta(data.moodDeltaAvg)}
- Mood change range: ${formatDelta(data.moodDeltaMin)} to ${formatDelta(data.moodDeltaMax)}

## Session Context Distribution
### Intensity
- Casual: ${data.intensityDistribution.casual} sessions (${pct(data.intensityDistribution.casual, data.sessionsCount)})
- Moderate: ${data.intensityDistribution.moderate} sessions (${pct(data.intensityDistribution.moderate, data.sessionsCount)})
- Competitive: ${data.intensityDistribution.competitive} sessions (${pct(data.intensityDistribution.competitive, data.sessionsCount)})

### Format
- Singles: ${data.formatDistribution.singles} sessions (${pct(data.formatDistribution.singles, data.sessionsCount)})
- Doubles: ${data.formatDistribution.doubles} sessions (${pct(data.formatDistribution.doubles, data.sessionsCount)})

### Environment
- Indoor: ${data.environmentDistribution.indoor} sessions (${pct(data.environmentDistribution.indoor, data.sessionsCount)})
- Outdoor: ${data.environmentDistribution.outdoor} sessions (${pct(data.environmentDistribution.outdoor, data.sessionsCount)})

## Soreness Patterns
### Knees
- None: ${data.sorenessFrequency.knees.none} (${pct(data.sorenessFrequency.knees.none, data.sessionsCount)})
- Low: ${data.sorenessFrequency.knees.low} (${pct(data.sorenessFrequency.knees.low, data.sessionsCount)})
- Moderate: ${data.sorenessFrequency.knees.moderate} (${pct(data.sorenessFrequency.knees.moderate, data.sessionsCount)})
- High: ${data.sorenessFrequency.knees.high} (${pct(data.sorenessFrequency.knees.high, data.sessionsCount)})

### Shoulder
- None: ${data.sorenessFrequency.shoulder.none} (${pct(data.sorenessFrequency.shoulder.none, data.sessionsCount)})
- Low: ${data.sorenessFrequency.shoulder.low} (${pct(data.sorenessFrequency.shoulder.low, data.sessionsCount)})
- Moderate: ${data.sorenessFrequency.shoulder.moderate} (${pct(data.sorenessFrequency.shoulder.moderate, data.sessionsCount)})
- High: ${data.sorenessFrequency.shoulder.high} (${pct(data.sorenessFrequency.shoulder.high, data.sessionsCount)})

### Back
- None: ${data.sorenessFrequency.back.none} (${pct(data.sorenessFrequency.back.none, data.sessionsCount)})
- Low: ${data.sorenessFrequency.back.low} (${pct(data.sorenessFrequency.back.low, data.sessionsCount)})
- Moderate: ${data.sorenessFrequency.back.moderate} (${pct(data.sorenessFrequency.back.moderate, data.sessionsCount)})
- High: ${data.sorenessFrequency.back.high} (${pct(data.sorenessFrequency.back.high, data.sessionsCount)})

## Mental State Patterns
${Object.entries(data.mentalTagsFrequency)
  .sort(([, a], [, b]) => b - a)
  .map(([tag, count]) => `- ${tag}: ${count} sessions (${pct(count, data.sessionsCount)})`)
  .join('\n')}

## Format Comparisons
### Singles (${data.formatComparisons.singles.count} sessions)
- Average energy change: ${formatDelta(data.formatComparisons.singles.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.formatComparisons.singles.avgMoodDelta)}

### Doubles (${data.formatComparisons.doubles.count} sessions)
- Average energy change: ${formatDelta(data.formatComparisons.doubles.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.formatComparisons.doubles.avgMoodDelta)}

## Environment Comparisons
### Indoor (${data.environmentComparisons.indoor.count} sessions)
- Average energy change: ${formatDelta(data.environmentComparisons.indoor.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.environmentComparisons.indoor.avgMoodDelta)}

### Outdoor (${data.environmentComparisons.outdoor.count} sessions)
- Average energy change: ${formatDelta(data.environmentComparisons.outdoor.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.environmentComparisons.outdoor.avgMoodDelta)}

## Intensity Comparisons
### Casual (${data.intensityComparisons.casual.count} sessions)
- Average energy change: ${formatDelta(data.intensityComparisons.casual.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.intensityComparisons.casual.avgMoodDelta)}

### Moderate (${data.intensityComparisons.moderate.count} sessions)
- Average energy change: ${formatDelta(data.intensityComparisons.moderate.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.intensityComparisons.moderate.avgMoodDelta)}

### Competitive (${data.intensityComparisons.competitive.count} sessions)
- Average energy change: ${formatDelta(data.intensityComparisons.competitive.avgEnergyDelta)}
- Average mood change: ${formatDelta(data.intensityComparisons.competitive.avgMoodDelta)}

${data.avgDurationMinutes ? `\n## Duration\n- Average session duration: ${Math.round(data.avgDurationMinutes)} minutes\n` : ''}

---

Identify 3-7 durable observational patterns from this data. Focus on:
- Energy and mood trajectories
- Soreness patterns and correlations with intensity/format
- Format and environment associations
- Mental state correlations
- Intensity impact patterns

Return ONLY a JSON array of insights. No additional commentary.`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format delta with sign
 */
function formatDelta(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `${rounded}`;
  return '0';
}

/**
 * Calculate percentage
 */
function pct(count: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((count / total) * 100)}%`;
}

/**
 * Sanitize AI output to remove any coaching language that slipped through
 */
export function sanitizeInsightLanguage(text: string): string {
  const coachingPhrases = [
    /\bshould\b/gi,
    /\btry\b/gi,
    /\brecommend\b/gi,
    /\bneed to\b/gi,
    /\bconsider\b/gi,
    /\bmight want to\b/gi,
    /\byou could\b/gi,
    /\bwould be better\b/gi,
  ];

  coachingPhrases.forEach((phrase) => {
    if (phrase.test(text)) {
      console.warn(`[Insight Sanitizer] Detected coaching language: ${phrase}`);
      // Flag for manual review but don't auto-modify (could break sentence structure)
    }
  });

  return text;
}
