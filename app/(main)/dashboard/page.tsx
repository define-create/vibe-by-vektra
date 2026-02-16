/**
 * Dashboard Page v1.1 - Deterministic Briefing Surface
 *
 * Answers the question: "What has meaningfully changed recently?"
 *
 * Features:
 * - Time window comparison (14 days recent vs baseline)
 * - Notable shifts detection (threshold-based)
 * - Neutral, observational language
 * - Sample-size gating for reliable comparisons
 * - Recommendation outcomes (Week 2 feature)
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { ScreenContainer } from '@/src/components/layout/ScreenContainer';
import { VerticalStack } from '@/src/components/layout/VerticalStack';
import { MetricStrip } from '@/src/components/domain/MetricStrip';
import { Card } from '@/src/components/ui/Card';
import { IconButton } from '@/src/components/ui/IconButton';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Button } from '@/src/components/ui/Button';
import { useSessionLogs } from '@/lib/hooks/useSessionLogs';
import { useRouter } from 'next/navigation';
import { getDashboardData } from '@/lib/analytics/dashboard-metrics';

// Dashboard v1.1 components
import { NotableShiftsCard } from '@/src/components/domain/dashboard/NotableShiftsCard';
import { EnergyResponseCard } from '@/src/components/domain/dashboard/EnergyResponseCard';
import { RecoverySignalsCard } from '@/src/components/domain/dashboard/RecoverySignalsCard';
import { ContextComparisonsCard } from '@/src/components/domain/dashboard/ContextComparisonsCard';
import { RecentSessionsList } from '@/src/components/domain/dashboard/RecentSessionsList';

// Recommendation features (Week 2)
import { OutcomeCard } from '@/src/components/insights/OutcomeCard';
import { RecommendationBanner } from '@/src/components/insights/RecommendationBanner';
import {
  getPendingRecommendation,
  generateOutcome,
  getActiveOutcomes,
  shouldShowBanner,
  markBannerShown,
  dismissOutcome,
  type PendingRecommendation,
} from '@/lib/insights/recommendation-tracker';
import type { LocalRecommendationOutcome } from '@/lib/db/local-db';

export default function DashboardPage() {
  const router = useRouter();
  const { sessions, isLoading } = useSessionLogs();

  // Time window state
  const [daysBack, setDaysBack] = useState<7 | 14 | 28>(14);
  const [timeWindowSheetOpen, setTimeWindowSheetOpen] = useState(false);

  // Recommendation state (Week 2 feature - keep existing)
  const [activeOutcome, setActiveOutcome] = useState<LocalRecommendationOutcome | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [pendingRec, setPendingRec] = useState<PendingRecommendation | null>(null);

  // Check for recommendation outcomes (existing Week 2 logic)
  useEffect(() => {
    async function checkForOutcomes() {
      if (!sessions || sessions.length === 0) return;

      const pending = getPendingRecommendation();
      if (pending) {
        if (shouldShowBanner()) {
          setPendingRec(pending);
          setShowBanner(true);
          markBannerShown();
        }

        const outcome = await generateOutcome(sessions, pending);
        if (outcome) {
          setActiveOutcome(outcome);
          setShowBanner(false);
          return;
        }
      }

      const outcomes = await getActiveOutcomes();
      if (outcomes.length > 0) {
        setActiveOutcome(outcomes[0]);
      }
    }

    checkForOutcomes();
  }, [sessions]);

  // Compute dashboard data (new v1.1 logic)
  const dashboardData = useMemo(() => {
    if (sessions.length < 4) {
      // For < 4 sessions, return minimal structure
      return {
        windowConfig: {
          recent: { sessionCount: sessions.length, label: 'Recent' },
          baseline: null,
          daysBack,
          mode: 'insufficient-data' as const,
        },
        recentMetrics: {
          sessionCount: sessions.length,
          sessions,
          avgEnergyBefore: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.energyBefore, 0) / sessions.length : 0,
          avgEnergyAfter: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.energyAfter, 0) / sessions.length : 0,
          avgEnergyDelta: sessions.length > 0 ? sessions.reduce((sum, s) => sum + (s.energyAfter - s.energyBefore), 0) / sessions.length : 0,
          avgMoodBefore: 0,
          avgMoodAfter: 0,
          avgMoodDelta: 0,
          sorenessFrequency: { hands: 0, knees: 0, shoulder: 0, back: 0 },
          avgDuration: 0,
          intensityDistribution: { casual: 0, moderate: 0, competitive: 0 },
          formatDistribution: { singles: 0, doubles: 0 },
          topMentalTags: [],
        },
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

    return getDashboardData(sessions, daysBack);
  }, [sessions, daysBack]);

  // Build Recent Activity Summary metrics (Section B)
  const recentActivityMetrics = useMemo(() => {
    const { recentMetrics } = dashboardData;

    // Session mix calculation
    const singlesCount = recentMetrics.formatDistribution.singles;
    const doublesCount = recentMetrics.formatDistribution.doubles;
    const competitiveCount = recentMetrics.intensityDistribution.competitive;

    const doublesPercent = recentMetrics.sessionCount > 0
      ? Math.round((doublesCount / recentMetrics.sessionCount) * 100)
      : 0;
    const competitivePercent = recentMetrics.sessionCount > 0
      ? Math.round((competitiveCount / recentMetrics.sessionCount) * 100)
      : 0;

    const mixLabel = `${doublesPercent}% doubles, ${competitivePercent}% competitive`;

    return [
      {
        label: 'Sessions',
        value: recentMetrics.sessionCount.toString(),
        delta: undefined,
        deltaDirection: 'neutral' as const,
      },
      {
        label: 'Avg Duration',
        value: recentMetrics.avgDuration > 0 ? `${Math.round(recentMetrics.avgDuration)} min` : '-',
        delta: undefined,
        deltaDirection: 'neutral' as const,
      },
      {
        label: 'Mix',
        value: mixLabel,
        delta: undefined,
        deltaDirection: 'neutral' as const,
      },
    ];
  }, [dashboardData]);

  // Render functions for different states
  const renderEmptyState = () => (
    <Card variant="callout" padding="hero" className="space-y-md text-center">
      <h2 className="text-body-lg font-semibold text-text-primary">
        Welcome to Vibe
      </h2>
      <p className="text-body text-text-secondary">
        Log your first volleyball session to start tracking your performance.
      </p>
      <Button
        onClick={() => router.push('/history')}
        className="mt-md"
      >
        Log Session
      </Button>
    </Card>
  );

  const renderInsufficientDataState = () => (
    <VerticalStack spacing="lg">
      {/* Recent Activity Summary (limited) */}
      <Card variant="default" padding="default">
        <MetricStrip metrics={recentActivityMetrics as [any, any, any]} />
      </Card>

      {/* Notable Shifts (empty state) */}
      <NotableShiftsCard
        shifts={[]}
        isEmpty={true}
      />

      {/* Energy Response (recent only, no comparison) */}
      <EnergyResponseCard
        metrics={dashboardData.recentMetrics}
        comparison={null}
      />

      {/* Recent Sessions */}
      <RecentSessionsList sessions={dashboardData.latestSessions} />
    </VerticalStack>
  );

  const renderFullDashboard = () => (
    <VerticalStack spacing="lg">
      {/* Recommendation Banner (Week 2 - keep existing) */}
      {showBanner && pendingRec && (
        <RecommendationBanner
          recommendation={pendingRec}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Recommendation Outcome (Week 2 - keep existing) */}
      {activeOutcome && (
        <OutcomeCard
          outcome={activeOutcome}
          onDismiss={async () => {
            setActiveOutcome(null);
            await dismissOutcome(activeOutcome.id);
          }}
          onCtaClick={() => router.push(activeOutcome.linkTo || '/insights')}
        />
      )}

      {/* B. Recent Activity Summary */}
      <Card variant="default" padding="default">
        <MetricStrip metrics={recentActivityMetrics as [any, any, any]} />
      </Card>

      {/* C. Notable Shifts (PRIMARY CARD) */}
      <NotableShiftsCard
        shifts={dashboardData.notableShifts}
        isEmpty={dashboardData.sampleSizeWarnings.recentTooSmall || dashboardData.sampleSizeWarnings.baselineTooSmall}
      />

      {/* D. Energy Response */}
      <EnergyResponseCard
        metrics={dashboardData.recentMetrics}
        comparison={dashboardData.comparison}
      />

      {/* E. Recovery Signals */}
      <RecoverySignalsCard
        metrics={dashboardData.recentMetrics}
        comparison={dashboardData.comparison}
      />

      {/* F. Context Comparisons (conditional) */}
      {!dashboardData.sampleSizeWarnings.categoryComparisonsUnsupported && (
        <ContextComparisonsCard
          metrics={dashboardData.recentMetrics}
          sampleSizeSupported={!dashboardData.sampleSizeWarnings.categoryComparisonsUnsupported}
        />
      )}

      {/* G. Recent Sessions */}
      <RecentSessionsList sessions={dashboardData.latestSessions} />
    </VerticalStack>
  );

  // Build subtitle based on window config
  const subtitle = useMemo(() => {
    if (sessions.length === 0) {
      return 'Your volleyball journey at a glance';
    }

    const { windowConfig } = dashboardData;

    if (windowConfig.mode === 'insufficient-data') {
      return `${windowConfig.recent.sessionCount} sessions logged`;
    }

    if (windowConfig.mode === 'dynamic-split') {
      return `${windowConfig.recent.sessionCount} recent sessions (vs ${windowConfig.baseline?.sessionCount || 0} previous)`;
    }

    // Standard mode
    if (windowConfig.baseline) {
      return `Last ${daysBack} days · Compared to prior ${daysBack} days`;
    }

    return `Last ${daysBack} days`;
  }, [sessions.length, dashboardData, daysBack]);

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle={subtitle}
      rightActions={
        sessions.length >= 10 ? (
          <IconButton
            icon={<Calendar size={20} />}
            label="Change time window"
            onClick={() => setTimeWindowSheetOpen(true)}
          />
        ) : undefined
      }
    >
      {isLoading ? (
        <VerticalStack spacing="lg">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </VerticalStack>
      ) : sessions.length === 0 ? (
        renderEmptyState()
      ) : sessions.length < 4 ? (
        renderInsufficientDataState()
      ) : (
        renderFullDashboard()
      )}

      {/* Time Window Selector Bottom Sheet */}
      <BottomSheet
        open={timeWindowSheetOpen}
        onOpenChange={setTimeWindowSheetOpen}
        title="Analysis Window"
        snapPoint="40%"
      >
        <div className="space-y-md">
          <p className="text-body-sm text-text-secondary mb-md">
            Choose the time window for comparison
          </p>

          {/* Time window options */}
          <div className="space-y-sm">
            {[
              { value: 7, label: 'Last 7 days', sublabel: 'vs previous 7 days' },
              { value: 14, label: 'Last 14 days', sublabel: 'vs previous 14 days' },
              { value: 28, label: 'Last 28 days', sublabel: 'vs previous 28 days' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setDaysBack(option.value as 7 | 14 | 28);
                  setTimeWindowSheetOpen(false);
                }}
                className={`
                  w-full p-md rounded-lg border-2 transition-all text-left
                  ${daysBack === option.value
                    ? 'border-accent-primary bg-accent-primary/5'
                    : 'border-border bg-surface-1 hover:bg-surface-2'
                  }
                `}
              >
                <p className="text-body-sm font-medium text-text-primary">
                  {option.label}
                  {daysBack === option.value && (
                    <span className="ml-xs text-accent-primary">✓</span>
                  )}
                </p>
                <p className="text-meta-sm text-text-secondary mt-xxs">
                  {option.sublabel}
                </p>
              </button>
            ))}
          </div>

          <p className="text-meta-xs text-text-disabled mt-md">
            Comparison windows adjust automatically based on your session history.
          </p>
        </div>
      </BottomSheet>
    </ScreenContainer>
  );
}
