/**
 * Insights Page - Zen Precision redesign with preserved functionality
 * Timeline narrative view for AI-generated insights
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAnonId } from '@/lib/utils/anon-id';
import { localDB } from '@/lib/db/local-db';
import { InsightArtifact, InsightRun } from '@/types';
import { ScreenContainer } from '@/src/components/layout/ScreenContainer';
import { VerticalStack } from '@/src/components/layout/VerticalStack';
import { TimelineBlock } from '@/src/components/domain/TimelineBlock';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { IconButton } from '@/src/components/ui/IconButton';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { GuestLockedState } from '@/components/insights/GuestLockedState';

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
  const [currentRange, setCurrentRange] = useState('Last 14 days');

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
    setIsLoading(false);
  }

  async function handleGenerate() {
    setError(null);

    try {
      const anonId = mode === 'guest' ? getAnonId() : null;

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

      if (data.artifacts) {
        setInsights(data.artifacts);
        setLatestRun(data.run);
      } else if (data.insights) {
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

  const hasInsights = insights.length > 0;

  return (
    <ScreenContainer
      title="Insights"
      subtitle="AI-powered pattern analysis & guidance"
      rightActions={
        hasInsights ? (
          <div className="flex items-center gap-xs">
            <IconButton icon={<ChevronLeft size={20} />} label="Previous period" />
            <span className="text-meta text-text-secondary px-sm">{currentRange}</span>
            <IconButton icon={<ChevronRight size={20} />} label="Next period" />
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <VerticalStack spacing="lg">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </VerticalStack>
      ) : (
        <VerticalStack spacing="lg">
          {/* Generate Button or Guest Locked State */}
          {!hasInsights && (
            <>
              {quotaStatus?.isGuest && quotaStatus?.guestUsed ? (
                <GuestLockedState />
              ) : quotaStatus ? (
                <Card variant="default" padding="default" className="space-y-md">
                  <div className="space-y-sm">
                    <h3 className="text-section text-text-primary">Generate Insights</h3>
                    <p className="text-body text-text-secondary">
                      Analyze your recent sessions to discover patterns and get personalized
                      recommendations.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-meta-sm text-text-disabled">
                      Daily quota: {quotaStatus.daily.used}/{quotaStatus.daily.limit}
                    </span>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isQuotaExceeded}
                    >
                      Generate Insights
                    </Button>
                  </div>
                </Card>
              ) : null}

              {error && (
                <Card variant="default" padding="default" className="bg-semantic-alert/10">
                  <p className="text-body text-semantic-alert">{error}</p>
                </Card>
              )}

              {!error && (
                <div className="text-center py-xl">
                  <p className="text-body text-text-secondary">
                    No insights yet. Log at least 3 sessions, then generate your first insight.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Insights Timeline View */}
          {hasInsights && (
            <>
              {/* Insight Thesis Hero */}
              <Card variant="callout" padding="default" className="space-y-sm">
                <h2 className="text-title text-text-primary">
                  {insights[0]?.title || 'Your session insights are ready'}
                </h2>
                <p className="text-body text-text-secondary">
                  {insights[0]?.content?.substring(0, 200) ||
                    'Based on your recent sessions, we\'ve identified key patterns.'}
                </p>
                {latestRun && (
                  <div className="flex items-center gap-md pt-sm">
                    <div className="space-y-xs">
                      <span className="text-meta-sm text-text-disabled">Sessions Analyzed</span>
                      <span className="text-meta text-text-primary font-medium block">
                        {latestRun.sessionsCount || 0}
                      </span>
                    </div>
                    <div className="space-y-xs">
                      <span className="text-meta-sm text-text-disabled">Generated</span>
                      <span className="text-meta text-text-primary font-medium block">
                        {new Date(latestRun.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Timeline Blocks */}
              <div className="space-y-xs">
                <h3 className="text-section text-text-primary">Analysis & Recommendations</h3>
                <VerticalStack spacing="md">
                  {insights.map((insight, index) => (
                    <TimelineBlock
                      key={insight.id}
                      item={{
                        variant: index % 3 === 1 ? 'callout' : index % 3 === 2 ? 'guidance' : 'evidence',
                        title: insight.title,
                        body: insight.content,
                      }}
                    />
                  ))}
                </VerticalStack>
              </div>

              {/* Disclaimer */}
              <p className="text-meta-sm text-text-disabled text-center italic">
                Insights are generated by AI analyzing your session patterns. Always consult with
                coaches and medical professionals for personalized advice.
              </p>

              {/* Regenerate Button */}
              {quotaStatus && !isQuotaExceeded && (
                <div className="flex justify-center">
                  <Button variant="secondary" onClick={handleGenerate}>
                    Generate New Insights
                  </Button>
                </div>
              )}
            </>
          )}
        </VerticalStack>
      )}
    </ScreenContainer>
  );
}
