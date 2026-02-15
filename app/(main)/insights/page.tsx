/**
 * Insights Page - Week 2 Enhancement
 * Mode toggle: Rule-based (default) vs AI insights
 * Rule-based: deterministic, always available, no quota
 * AI: preserved functionality with quota limits
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSessionLogs } from '@/lib/hooks/useSessionLogs';
import { getAnonId } from '@/lib/utils/anon-id';
import { localDB, type LocalRecommendationOutcome } from '@/lib/db/local-db';
import { InsightArtifact, InsightRun } from '@/types';
import { cn } from '@/lib/utils';
import { ScreenContainer } from '@/src/components/layout/ScreenContainer';
import { VerticalStack } from '@/src/components/layout/VerticalStack';
import { TimelineBlock } from '@/src/components/domain/TimelineBlock';
import { InsightThesisHero } from '@/src/components/domain/InsightThesisHero';
import { InsightActionsCard } from '@/src/components/domain/InsightActionsCard';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { IconButton } from '@/src/components/ui/IconButton';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { GuestLockedState } from '@/components/insights/GuestLockedState';
import { generateInsights } from '@/lib/insights/rule-based-generator';

type InsightMode = 'rule-based' | 'ai';

const INSIGHT_MODE_KEY = 'vibe_insight_mode';

export default function InsightsPage() {
  const { mode, user } = useAuth();
  const { sessions, isLoading: sessionsLoading } = useSessionLogs();

  // Mode toggle state (default: rule-based)
  const [insightMode, setInsightMode] = useState<InsightMode>('rule-based');
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
  const [achievements, setAchievements] = useState<LocalRecommendationOutcome[]>([]);

  // Generate rule-based insights from session data
  const ruleBasedInsight = useMemo(() => {
    if (sessionsLoading || !sessions) return null;
    return generateInsights(sessions);
  }, [sessions, sessionsLoading]);

  // Load saved mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(INSIGHT_MODE_KEY) as InsightMode | null;
      if (saved === 'ai' || saved === 'rule-based') {
        setInsightMode(saved);
      }
    }
  }, []);

  // Save mode preference when changed
  const handleModeChange = (newMode: InsightMode) => {
    setInsightMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(INSIGHT_MODE_KEY, newMode);
    }
  };

  useEffect(() => {
    fetchQuotaStatus();
    if (user) {
      fetchLatestInsights();
    }
  }, [user, mode]);

  // Load achievements from IndexedDB
  useEffect(() => {
    async function loadAchievements() {
      // Get all outcomes from IndexedDB (dismissed and active)
      const allOutcomes = await localDB.recommendationOutcomes
        .orderBy('createdAt')
        .reverse()
        .toArray();

      // Clean up duplicates (keep most recent for each recommendationId)
      const byRecommendationId = new Map<string, LocalRecommendationOutcome>();
      const duplicatesToDelete: string[] = [];

      for (const outcome of allOutcomes) {
        const existing = byRecommendationId.get(outcome.recommendationId);
        if (existing) {
          // Keep the most recent one
          if (new Date(outcome.createdAt) > new Date(existing.createdAt)) {
            duplicatesToDelete.push(existing.id);
            byRecommendationId.set(outcome.recommendationId, outcome);
          } else {
            duplicatesToDelete.push(outcome.id);
          }
        } else {
          byRecommendationId.set(outcome.recommendationId, outcome);
        }
      }

      // Delete duplicates from IndexedDB
      if (duplicatesToDelete.length > 0) {
        console.log('[Insights] Cleaning up duplicate outcomes:', duplicatesToDelete.length);
        await localDB.recommendationOutcomes.bulkDelete(duplicatesToDelete);
      }

      // Filter for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentAchievements = Array.from(byRecommendationId.values()).filter(
        outcome => new Date(outcome.createdAt) >= thirtyDaysAgo
      );

      // Sort by most recent first
      recentAchievements.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAchievements(recentAchievements);
    }

    loadAchievements();
  }, []);

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
      subtitle={
        insightMode === 'rule-based'
          ? 'Pattern analysis & actionable guidance'
          : 'AI-powered pattern analysis & guidance'
      }
      rightActions={
        hasInsights && insightMode === 'ai' ? (
          <div className="flex items-center gap-xs">
            <IconButton icon={<ChevronLeft size={20} />} label="Previous period" />
            <span className="text-meta text-text-secondary px-sm">{currentRange}</span>
            <IconButton icon={<ChevronRight size={20} />} label="Next period" />
          </div>
        ) : undefined
      }
    >
      {/* Mode Toggle */}
      <div className="flex gap-sm mb-lg">
        <Button
          variant={insightMode === 'rule-based' ? 'primary' : 'secondary'}
          size="default"
          onClick={() => handleModeChange('rule-based')}
          className="flex-1"
        >
          Pattern Analysis
        </Button>
        <Button
          variant={insightMode === 'ai' ? 'primary' : 'secondary'}
          size="default"
          onClick={() => handleModeChange('ai')}
          className="flex-1"
        >
          AI Insights
        </Button>
      </div>

      {isLoading || sessionsLoading ? (
        <VerticalStack spacing="lg">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </VerticalStack>
      ) : (
        <VerticalStack spacing="lg">
          {/* Rule-Based Insights Mode */}
          {insightMode === 'rule-based' && ruleBasedInsight && (
            <>
              {/* Thesis Hero */}
              <InsightThesisHero thesis={ruleBasedInsight.thesis} />

              {/* Timeline */}
              <div className="space-y-xs">
                <h3 className="text-section text-text-primary">Analysis & Guidance</h3>
                <VerticalStack spacing="md">
                  {ruleBasedInsight.timeline.map((item) => (
                    <TimelineBlock key={item.id} item={item} />
                  ))}
                </VerticalStack>
              </div>

              {/* Actions */}
              <InsightActionsCard
                actions={ruleBasedInsight.actions}
                onActionClick={(actionId) => {
                  console.log('Action clicked:', actionId);
                  // Future: Navigate or show confirmation
                }}
              />

              {/* Achievements List (shows all outcomes from last 30 days) */}
              {achievements.length > 0 && (
                <div className="space-y-xs">
                  <h3 className="text-section text-text-primary">Recent Achievements</h3>
                  <p className="text-meta-sm text-text-secondary mb-sm">
                    Your progress over the last 30 days
                  </p>
                  <VerticalStack spacing="sm">
                    {achievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        variant="default"
                        padding="default"
                        className={cn(
                          achievement.dismissedAt ? 'opacity-60' : ''
                        )}
                      >
                        <div className="flex items-start gap-sm">
                          <div className="p-xs rounded bg-accent-primary/10">
                            <TrendingUp size={14} className="text-accent-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-meta text-text-primary font-medium">
                              {achievement.title}
                            </h4>
                            <p className="text-meta-sm text-text-secondary mt-xs">
                              {achievement.body}
                            </p>
                            <p className="text-meta-sm text-text-disabled mt-xs">
                              {new Date(achievement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </VerticalStack>
                </div>
              )}
            </>
          )}

          {/* AI Insights Mode (preserved functionality) */}
          {insightMode === 'ai' && (
            <>
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
                  {insights[0]?.observationText?.substring(0, 200) ||
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
                        body: insight.observationText,
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
          {/* End AI Mode */}
          </>
          )}
        </VerticalStack>
      )}
    </ScreenContainer>
  );
}
