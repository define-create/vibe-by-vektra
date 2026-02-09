'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAnonId } from '@/lib/utils/anon-id';
import { localDB } from '@/lib/db/local-db';
import { GenerateButton } from '@/components/insights/GenerateButton';
import { GuestLockedState } from '@/components/insights/GuestLockedState';
import { InsightsList } from '@/components/insights/InsightsList';
import { InsightArtifact, InsightRun } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function InsightsPage() {
  const { mode, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quotaStatus, setQuotaStatus] = useState<{
    daily: { used: number; limit: number };
    monthly: { used: number; limit: number };
    isGuest: boolean;
    guestUsed: boolean;
  } | null>(null);
  const [latestRun, setLatestRun] = useState<InsightRun | null>(null);
  const [insights, setInsights] = useState<InsightArtifact[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch quota status on mount
  useEffect(() => {
    fetchQuotaStatus();
    if (user) {
      fetchLatestInsights();
    }
  }, [user, mode]);

  async function fetchQuotaStatus() {
    try {
      const anonId = mode === 'guest' ? getAnonId() : null;
      const params = new URLSearchParams();
      if (anonId) params.set('anonId', anonId);

      const response = await fetch(`/api/insights/check-quota?${params}`);
      const data = await response.json();

      setQuotaStatus(data);
    } catch (err) {
      console.error('Failed to fetch quota status:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchLatestInsights() {
    // TODO: Implement fetching latest insights from Supabase
    // For now, this is a placeholder
    setIsLoading(false);
  }

  async function handleGenerate() {
    setError(null);

    try {
      const anonId = mode === 'guest' ? getAnonId() : null;

      // For guest mode, fetch sessions from IndexedDB and send them
      let guestSessions = null;
      if (mode === 'guest') {
        const localSessions = await localDB.sessionLogs.toArray();
        guestSessions = localSessions.map(s => ({
          id: s.id,
          userId: '',
          createdAt: s.createdAt,
          playedAt: s.playedAt,
          energyBefore: s.energyBefore,
          energyAfter: s.energyAfter,
          moodBefore: s.moodBefore,
          moodAfter: s.moodAfter,
          sorenessKnees: s.sorenessKnees,
          sorenessShoulder: s.sorenessShoulder,
          sorenessBack: s.sorenessBack,
          intensity: s.intensity,
          format: s.format,
          environment: s.environment,
          durationMinutes: s.durationMinutes,
          mentalTags: s.mentalTags,
          freeTextReflection: s.freeTextReflection,
          peopleIdsPlayedWith: s.peopleIdsPlayedWith,
          peopleIdsPlayedAgainst: s.peopleIdsPlayedAgainst,
        }));
      }

      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windowDays: 14,
          anonId,
          guestSessions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate insights');
        return;
      }

      // Update quota status
      if (data.quotaUsed !== undefined) {
        setQuotaStatus((prev) =>
          prev
            ? {
                ...prev,
                daily: { ...prev.daily, used: data.quotaUsed },
                guestUsed: mode === 'guest' ? true : prev.guestUsed,
              }
            : null
        );
      }

      // Update insights
      if (data.artifacts) {
        setInsights(data.artifacts);
        setLatestRun(data.run);
      } else if (data.insights) {
        // Guest mode response
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  }

  const isQuotaExceeded =
    (quotaStatus?.isGuest && quotaStatus?.guestUsed) ||
    (quotaStatus?.daily && quotaStatus.daily.used >= quotaStatus.daily.limit) ||
    false;

  const getDisabledReason = () => {
    if (quotaStatus?.isGuest && quotaStatus?.guestUsed) {
      return 'Guest quota used';
    }
    if (quotaStatus?.daily && quotaStatus.daily.used >= quotaStatus.daily.limit) {
      return 'Daily limit reached';
    }
    return undefined;
  };

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto pb-24">
      <div className="pt-8 pb-6 space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-powered pattern analysis
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Guest locked state */}
          {quotaStatus?.isGuest && quotaStatus?.guestUsed ? (
            <GuestLockedState />
          ) : (
            /* Generate button */
            quotaStatus && (
              <GenerateButton
                onGenerate={handleGenerate}
                quotaUsed={quotaStatus.daily.used}
                quotaLimit={quotaStatus.daily.limit}
                isDisabled={isQuotaExceeded}
                disabledReason={getDisabledReason()}
              />
            )
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Insights list */}
          {insights.length > 0 ? (
            <InsightsList
              insights={insights}
              runDate={latestRun?.createdAt}
              sessionsCount={latestRun?.sessionsCount}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No insights yet. Log at least 3 sessions, then generate your
                first insight.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
