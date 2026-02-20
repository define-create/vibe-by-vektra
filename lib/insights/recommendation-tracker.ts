/**
 * Recommendation Tracking System
 * Tracks when users follow advice and generates outcome feedback
 * Week 2 feature: feedback loop for rule-based insights
 */

import { v4 as uuidv4 } from 'uuid';
import { localDB, localDBHelpers, type LocalSessionLog, type LocalRecommendationOutcome } from '@/lib/db/local-db';

// ============================================================================
// Type Definitions
// ============================================================================

export type RecommendationType = 'intensity' | 'consistency' | 'recovery';

export interface PendingRecommendation {
  id: string;
  type: RecommendationType;
  label: string;
  createdAt: string;
  targetValue?: unknown; // Optional expected outcome
  bannerShownAt?: string; // Timestamp when banner was first shown on Dashboard
}

export interface RecommendationOutcome {
  id: string;
  recommendationId: string;
  title: string;
  body: string;
  ctaLabel?: string;
  linkTo?: string;
  createdAt: string;
  dismissible: boolean;
}

// ============================================================================
// Storage Key Constants
// ============================================================================

const PENDING_REC_KEY = 'vibe_pending_recommendation';

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Set a pending recommendation for the user to follow
 */
export function setPendingRecommendation(
  recommendationId: string,
  type: RecommendationType,
  label: string,
  targetValue?: unknown
): void {
  const pending: PendingRecommendation = {
    id: recommendationId,
    type,
    label,
    createdAt: new Date().toISOString(),
    targetValue,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_REC_KEY, JSON.stringify(pending));
  }
}

/**
 * Get the current pending recommendation, if any
 */
export function getPendingRecommendation(): PendingRecommendation | null {
  console.log('[getPendingRecommendation] Called');
  console.log('[getPendingRecommendation] KEY:', PENDING_REC_KEY);

  if (typeof window === 'undefined') {
    console.log('[getPendingRecommendation] Window undefined, returning null');
    return null;
  }

  const stored = localStorage.getItem(PENDING_REC_KEY);
  console.log('[getPendingRecommendation] Raw localStorage value:', stored);

  if (!stored) {
    console.log('[getPendingRecommendation] No stored value found');
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as PendingRecommendation;
    console.log('[getPendingRecommendation] Parsed successfully:', parsed);
    return parsed;
  } catch (e) {
    console.error('[getPendingRecommendation] JSON parse error:', e);
    return null;
  }
}

/**
 * Clear the pending recommendation
 */
export function clearPendingRecommendation(): void {
  console.log('[clearPendingRecommendation] Called');
  console.trace('[clearPendingRecommendation] Stack trace');

  if (typeof window !== 'undefined') {
    const before = localStorage.getItem(PENDING_REC_KEY);
    console.log('[clearPendingRecommendation] Value before clearing:', before);
    localStorage.removeItem(PENDING_REC_KEY);
    console.log('[clearPendingRecommendation] Cleared from localStorage');
  }
}

/**
 * Mark a recommendation as completed and clear it
 */
export function markRecommendationDone(recommendationId: string): void {
  const pending = getPendingRecommendation();
  if (pending && pending.id === recommendationId) {
    clearPendingRecommendation();
  }
}

/**
 * Mark that the banner has been shown for the current recommendation
 */
export function markBannerShown(): void {
  const pending = getPendingRecommendation();
  if (!pending) return;

  // Don't mark again if already shown
  if (pending.bannerShownAt) return;

  pending.bannerShownAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_REC_KEY, JSON.stringify(pending));
  }
}

/**
 * Check if banner should be shown (recommendation exists and banner not shown yet)
 */
export function shouldShowBanner(): boolean {
  const pending = getPendingRecommendation();
  if (!pending) return false;

  // Only show if banner hasn't been shown yet
  return !pending.bannerShownAt;
}

// ============================================================================
// Outcome Detection Logic
// ============================================================================

/**
 * Check if a recommendation was followed based on session data
 * Returns true if the user's behavior matches the recommendation
 */
export function checkRecommendationFollowed(
  sessions: LocalSessionLog[],
  recommendation: PendingRecommendation
): boolean {
  console.log('[checkRecommendationFollowed] Checking recommendation:', recommendation);
  console.log('[checkRecommendationFollowed] Total sessions:', sessions.length);

  if (!sessions.length) {
    console.log('[checkRecommendationFollowed] No sessions, returning false');
    return false;
  }

  const recDate = new Date(recommendation.createdAt);
  console.log('[checkRecommendationFollowed] Recommendation created at:', recDate.toISOString());

  const sessionsAfter = sessions.filter(s => new Date(s.playedAt) > recDate);
  console.log('[checkRecommendationFollowed] Sessions after recommendation:', sessionsAfter.length);

  if (sessionsAfter.length === 0) {
    console.log('[checkRecommendationFollowed] No sessions after recommendation, returning false');
    return false;
  }

  console.log('[checkRecommendationFollowed] Checking type:', recommendation.type);

  switch (recommendation.type) {
    case 'intensity': {
      // Check if intensity was reduced or adjusted as recommended
      const sessionsBefore = sessions.filter(s => new Date(s.playedAt) <= recDate);

      if (sessionsBefore.length === 0) return false;

      const avgIntensityBefore = calculateAvgIntensity(sessionsBefore.slice(0, 3));
      const avgIntensityAfter = calculateAvgIntensity(sessionsAfter.slice(0, 2));

      // If recommendation was to reduce intensity, check if it decreased
      if (recommendation.label.toLowerCase().includes('reduce')) {
        return avgIntensityAfter < avgIntensityBefore;
      }

      // If recommendation was to adjust, check for any change
      return Math.abs(avgIntensityAfter - avgIntensityBefore) > 0.1;
    }

    case 'consistency': {
      console.log('[checkRecommendationFollowed] Checking consistency type');

      // Special case: if recommendation is about adding notes, check for that specifically
      if (recommendation.label.toLowerCase().includes('note')) {
        console.log('[checkRecommendationFollowed] Detected note-based recommendation');

        // Check if recent sessions have notes
        const recentSessions = sessionsAfter.slice(0, 3);
        const sessionsWithNotes = recentSessions.filter(
          s => s.freeTextReflection && s.freeTextReflection.trim().length > 0
        );

        console.log('[checkRecommendationFollowed] Recent sessions:', recentSessions.length);
        console.log('[checkRecommendationFollowed] Sessions with notes:', sessionsWithNotes.length);

        // Consider followed if at least one recent session has notes
        const followed = sessionsWithNotes.length > 0;
        console.log('[checkRecommendationFollowed] Note recommendation followed?', followed);
        return followed;
      }

      // Default: Check if session frequency increased
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const sessionsThisWeek = sessionsAfter.filter(
        s => new Date(s.playedAt) >= oneWeekAgo
      );
      console.log('[checkRecommendationFollowed] Sessions in last week:', sessionsThisWeek.length);

      // Compare to week before recommendation
      const twoWeeksBeforeRec = new Date(recDate);
      twoWeeksBeforeRec.setDate(twoWeeksBeforeRec.getDate() - 14);
      const oneWeekBeforeRec = new Date(recDate);
      oneWeekBeforeRec.setDate(oneWeekBeforeRec.getDate() - 7);

      const sessionsPrevWeek = sessions.filter(
        s => {
          const d = new Date(s.playedAt);
          return d >= twoWeeksBeforeRec && d < oneWeekBeforeRec;
        }
      );
      console.log('[checkRecommendationFollowed] Sessions in comparison week:', sessionsPrevWeek.length);
      console.log('[checkRecommendationFollowed] Comparison: ', sessionsThisWeek.length, '>', sessionsPrevWeek.length, '=', sessionsThisWeek.length > sessionsPrevWeek.length);

      // Frequency improved if current week has more sessions
      return sessionsThisWeek.length > sessionsPrevWeek.length;
    }

    case 'recovery': {
      // Check if soreness decreased or recovery improved
      const recentSessions = sessionsAfter.slice(0, 3);
      const sessionsBefore = sessions.filter(s => new Date(s.playedAt) <= recDate);
      const prevSessions = sessionsBefore.slice(0, 3);

      if (prevSessions.length === 0) return false;

      const avgSorenessAfter = calculateAvgSoreness(recentSessions);
      const avgSorenessBefore = calculateAvgSoreness(prevSessions);

      // Recovery improved if soreness decreased
      return avgSorenessAfter < avgSorenessBefore;
    }

    default:
      return false;
  }
}

/**
 * Generate an outcome card based on recommendation follow-through
 */
export async function generateOutcome(
  sessions: LocalSessionLog[],
  recommendation: PendingRecommendation
): Promise<LocalRecommendationOutcome | null> {
  console.log('[generateOutcome] Called with recommendation:', recommendation.label);
  console.log('[generateOutcome] Sessions count:', sessions.length);

  // Check if an outcome already exists for this recommendation
  const existingOutcomes = await localDB.recommendationOutcomes
    .where('recommendationId')
    .equals(recommendation.id)
    .toArray();

  if (existingOutcomes.length > 0) {
    console.log('[generateOutcome] Outcome already exists for this recommendation, returning existing:', existingOutcomes[0].title);
    return existingOutcomes[0];
  }

  const followed = checkRecommendationFollowed(sessions, recommendation);
  console.log('[generateOutcome] Recommendation followed?', followed);

  if (!followed) {
    console.log('[generateOutcome] Recommendation not followed, returning null');
    return null;
  }

  console.log('[generateOutcome] Creating new outcome...');

  const outcomeId = uuidv4();
  const recDate = new Date(recommendation.createdAt);
  const sessionsAfter = sessions.filter(s => new Date(s.playedAt) > recDate);

  let outcome: LocalRecommendationOutcome;

  switch (recommendation.type) {
    case 'intensity': {
      const sessionsBefore = sessions.filter(s => new Date(s.playedAt) <= recDate);
      const avgSorenessAfter = calculateAvgSoreness(sessionsAfter.slice(0, 3));
      const avgSorenessBefore = calculateAvgSoreness(sessionsBefore.slice(0, 3));
      const sorenessChange = avgSorenessBefore - avgSorenessAfter;

      outcome = {
        id: outcomeId,
        recommendationId: recommendation.id,
        title: sorenessChange > 0.3 ? 'Great adjustment!' : 'Intensity adjusted',
        body:
          sorenessChange > 0.3
            ? `Soreness signals dropped after adjusting intensity. Your current pacing appears sustainable.`
            : `You adjusted intensity as planned. Continue monitoring soreness over the next few sessions.`,
        ctaLabel: 'View latest insights',
        linkTo: '/insights',
        createdAt: new Date().toISOString(),
        dismissible: true,
      };
      break;
    }

    case 'consistency': {
      // Special case: note-based recommendation
      if (recommendation.label.toLowerCase().includes('note')) {
        const recentSessions = sessionsAfter.slice(0, 3);
        const sessionsWithNotes = recentSessions.filter(
          s => s.freeTextReflection && s.freeTextReflection.trim().length > 0
        );

        outcome = {
          id: outcomeId,
          recommendationId: recommendation.id,
          title: 'Great start with notes!',
          body: `You added notes to ${sessionsWithNotes.length} of your last ${recentSessions.length} session${
            recentSessions.length === 1 ? '' : 's'
          }. Session notes help reveal patterns that numbers alone can miss.`,
          ctaLabel: 'View your insights',
          linkTo: '/insights',
          createdAt: new Date().toISOString(),
          dismissible: true,
        };
        break;
      }

      // Default: frequency-based consistency
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const sessionsThisWeek = sessionsAfter.filter(
        s => new Date(s.playedAt) >= oneWeekAgo
      );

      outcome = {
        id: outcomeId,
        recommendationId: recommendation.id,
        title: 'Consistency improved!',
        body: `You logged ${sessionsThisWeek.length} session${
          sessionsThisWeek.length === 1 ? '' : 's'
        } this week. Steady routines usually lead to faster progress over time.`,
        ctaLabel: 'See your progress',
        linkTo: '/insights',
        createdAt: new Date().toISOString(),
        dismissible: true,
      };
      break;
    }

    case 'recovery': {
      const recentSessions = sessionsAfter.slice(0, 3);
      const avgSoreness = calculateAvgSoreness(recentSessions);

      outcome = {
        id: outcomeId,
        recommendationId: recommendation.id,
        title: avgSoreness < 1 ? 'Recovery on track' : 'Recovery progress noted',
        body:
          avgSoreness < 1
            ? 'Soreness signals are low. Your recovery approach appears effective.'
            : 'Recovery metrics are improving. Keep monitoring soreness and adjust as needed.',
        ctaLabel: 'View recovery trends',
        linkTo: '/insights',
        createdAt: new Date().toISOString(),
        dismissible: true,
      };
      break;
    }

    default:
      return null;
  }

  // Save outcome to IndexedDB
  console.log('[generateOutcome] Saving outcome to IndexedDB:', outcome);
  await localDBHelpers.addRecommendationOutcome(outcome);
  console.log('[generateOutcome] Outcome saved successfully');

  // Clear the pending recommendation
  console.log('[generateOutcome] Clearing pending recommendation');
  clearPendingRecommendation();

  console.log('[generateOutcome] Returning outcome:', outcome.title);
  return outcome;
}

/**
 * Dismiss an outcome card
 */
export async function dismissOutcome(outcomeId: string): Promise<void> {
  await localDBHelpers.dismissRecommendationOutcome(outcomeId);
}

/**
 * Get all active (non-dismissed) outcomes
 */
export async function getActiveOutcomes(): Promise<LocalRecommendationOutcome[]> {
  return await localDBHelpers.getActiveRecommendationOutcomes();
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateAvgIntensity(sessions: LocalSessionLog[]): number {
  if (!sessions.length) return 0;

  const intensityMap: Record<string, number> = {
    casual: 1,
    competitive: 2,
    training: 3,
  };

  const values = sessions.map(s => intensityMap[s.intensity] || 1);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateAvgSoreness(sessions: LocalSessionLog[]): number {
  if (!sessions.length) return 0;

  const values = sessions.map(
    s => (s.sorenessKnees + s.sorenessShoulder + s.sorenessBack) / 3
  );
  return values.reduce((a, b) => a + b, 0) / values.length;
}
