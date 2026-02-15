/**
 * Dashboard Page (Screen 1)
 * Narrative Stack + Hero Journey Emphasis
 * Uses real session data from local DB
 * Week 2 enhancement: recommendation outcome feedback
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { ScreenContainer } from '@/src/components/layout/ScreenContainer';
import { VerticalStack } from '@/src/components/layout/VerticalStack';
import { MetricStrip } from '@/src/components/domain/MetricStrip';
import { HeroJourneyCard } from '@/src/components/domain/HeroJourneyCard';
import { ChartCard } from '@/src/components/domain/ChartCard';
import { OutcomeCard } from '@/src/components/insights/OutcomeCard';
import { Card } from '@/src/components/ui/Card';
import { IconButton } from '@/src/components/ui/IconButton';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useSessionLogs } from '@/lib/hooks/useSessionLogs';
import { useRouter } from 'next/navigation';
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
import { RecommendationBanner } from '@/src/components/insights/RecommendationBanner';

export default function DashboardPage() {
  const router = useRouter();
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const { sessions, isLoading } = useSessionLogs();
  const [activeOutcome, setActiveOutcome] = useState<LocalRecommendationOutcome | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [pendingRec, setPendingRec] = useState<PendingRecommendation | null>(null);

  // Check for recommendation outcomes
  useEffect(() => {
    async function checkForOutcomes() {
      console.log('[Dashboard] checkForOutcomes started');
      console.log('[Dashboard] Sessions count:', sessions?.length);

      if (!sessions || sessions.length === 0) {
        console.log('[Dashboard] No sessions, returning early');
        return;
      }

      // Check for pending recommendation
      const pending = getPendingRecommendation();
      console.log('[Dashboard] Pending recommendation:', pending);

      if (pending) {
        // Check if we should show banner (not shown yet)
        if (shouldShowBanner()) {
          console.log('[Dashboard] Should show banner');
          setPendingRec(pending);
          setShowBanner(true);
          // Mark banner as shown
          markBannerShown();
        }

        console.log('[Dashboard] Generating outcome for pending recommendation...');
        // Generate outcome if recommendation was followed
        const outcome = await generateOutcome(sessions, pending);
        console.log('[Dashboard] Generated outcome:', outcome);

        if (outcome) {
          console.log('[Dashboard] Setting active outcome:', outcome.title);
          setActiveOutcome(outcome);
          // Hide banner if outcome generated
          setShowBanner(false);
          return;
        } else {
          console.log('[Dashboard] No outcome generated - recommendation not followed yet');
        }
      }

      // Otherwise, get existing active outcomes
      console.log('[Dashboard] Checking for existing outcomes...');
      const outcomes = await getActiveOutcomes();
      console.log('[Dashboard] Existing outcomes:', outcomes);

      if (outcomes.length > 0) {
        console.log('[Dashboard] Setting active outcome from existing:', outcomes[0].title);
        setActiveOutcome(outcomes[0]);
      } else {
        console.log('[Dashboard] No active outcomes found');
      }
    }

    checkForOutcomes();
  }, [sessions]);

  // Calculate real metrics from sessions
  const metrics = useMemo(() => {
    if (sessions.length === 0) {
      return [
        { label: 'Sessions', value: '0', delta: undefined, deltaDirection: 'neutral' as const },
        { label: 'Avg Energy', value: '-', delta: undefined, deltaDirection: 'neutral' as const },
        { label: 'Recovery', value: '-', delta: undefined, deltaDirection: 'neutral' as const },
      ];
    }

    // Calculate average energy after
    const avgEnergy = sessions.reduce((sum, s) => sum + s.energyAfter, 0) / sessions.length;

    // Calculate recovery score (inverse of average soreness)
    const avgSoreness = sessions.reduce((sum, s) =>
      sum + (s.sorenessKnees + s.sorenessShoulder + s.sorenessBack) / 3, 0
    ) / sessions.length;
    const recoveryScore = Math.round((1 - avgSoreness / 3) * 100);

    // Get recent sessions for comparison (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = sessions.filter(s => {
      const sessionDate = new Date(s.playedAt);
      const daysAgo = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });
    const previous7Days = sessions.filter(s => {
      const sessionDate = new Date(s.playedAt);
      const daysAgo = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 7 && daysAgo <= 14;
    });

    const sessionsDelta = last7Days.length - previous7Days.length;
    const energyDelta = last7Days.length > 0 && previous7Days.length > 0
      ? (last7Days.reduce((sum, s) => sum + s.energyAfter, 0) / last7Days.length) -
        (previous7Days.reduce((sum, s) => sum + s.energyAfter, 0) / previous7Days.length)
      : 0;

    return [
      {
        label: 'Sessions',
        value: sessions.length.toString(),
        delta: sessionsDelta !== 0 ? `${sessionsDelta > 0 ? '+' : ''}${sessionsDelta}` : undefined,
        deltaDirection: sessionsDelta > 0 ? 'up' as const : sessionsDelta < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        label: 'Avg Energy',
        value: avgEnergy.toFixed(1),
        delta: energyDelta !== 0 ? `${energyDelta > 0 ? '+' : ''}${energyDelta.toFixed(1)}` : undefined,
        deltaDirection: energyDelta > 0 ? 'up' as const : energyDelta < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        label: 'Recovery',
        value: `${recoveryScore}%`,
        delta: undefined,
        deltaDirection: 'neutral' as const,
      },
    ];
  }, [sessions]);

  // Create hero journey from recent sessions
  const heroJourney = useMemo(() => {
    if (sessions.length === 0) {
      return null;
    }

    // Find sessions with shoulder soreness to track recovery
    const shoulderSessions = sessions.filter(s => s.sorenessShoulder > 0);
    const recentSessions = sessions.slice(0, 10);

    const avgShoulder = shoulderSessions.length > 0
      ? shoulderSessions.reduce((sum, s) => sum + s.sorenessShoulder, 0) / shoulderSessions.length
      : 0;

    const completionPercent = Math.round((1 - avgShoulder / 3) * 100);

    return {
      id: 'shoulder-recovery',
      title: 'Shoulder Recovery & Form',
      status: completionPercent > 80 ? 'completed' as const : 'in-progress' as const,
      completionPercent,
      milestones: [
        { id: 'm1', label: 'Initial Assessment', isComplete: true },
        { id: 'm2', label: 'Pain-Free Serving', isComplete: completionPercent > 50 },
        { id: 'm3', label: 'Full Power', isComplete: completionPercent > 80 },
        { id: 'm4', label: 'Competition Ready', isComplete: completionPercent >= 95 },
      ],
      deltaText: `${recentSessions.length} sessions tracked`,
    };
  }, [sessions]);

  // Get recent insights preview (mock for now - replace with real insights)
  const insights = [
    { id: '1', title: 'Energy peaks mid-week', preview: 'Your best sessions are Tuesday-Thursday' },
    { id: '2', title: 'Recovery trending up', preview: 'Shoulder soreness down vs last month' },
  ];

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle="Your volleyball journey at a glance"
      rightActions={
        <IconButton
          icon={<Calendar size={20} />}
          label="Filter date range"
          onClick={() => setDateFilterOpen(true)}
        />
      }
    >
      {isLoading ? (
        <VerticalStack spacing="lg">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </VerticalStack>
      ) : sessions.length === 0 ? (
        <div className="text-center py-xl">
          <p className="text-body text-text-secondary">No sessions logged yet.</p>
          <p className="text-meta text-text-disabled mt-sm">
            Log your first session to see your dashboard.
          </p>
        </div>
      ) : (
        <VerticalStack spacing="lg">
          {/* Key Metrics Summary */}
          <Card variant="default" padding="default">
            <MetricStrip metrics={metrics as [any, any, any]} />
          </Card>

          {/* Recommendation Banner (Option 4: shows once, auto-dismisses) */}
          {showBanner && pendingRec && (
            <RecommendationBanner
              recommendation={pendingRec}
              onDismiss={() => setShowBanner(false)}
            />
          )}

          {/* Recommendation Outcome (Week 2 feature) */}
          {activeOutcome && (
            <OutcomeCard
              outcome={activeOutcome}
              onDismiss={async () => {
                // Dismiss from Dashboard UI
                setActiveOutcome(null);
                // Mark as dismissed in IndexedDB (persists for achievements list)
                await dismissOutcome(activeOutcome.id);
              }}
              onCtaClick={() => router.push(activeOutcome.linkTo || '/insights')}
            />
          )}

          {/* Hero Journey Progress */}
          {heroJourney && (
            <HeroJourneyCard
              journey={heroJourney}
              primaryCtaLabel="View details →"
              onPress={() => router.push('/journeys')}
              onPrimaryCta={() => router.push('/journeys')}
            />
          )}

          {/* Trend Chart */}
          <ChartCard
            title="Energy Trends"
            legend={[
              { label: 'Before', color: '#82AAFF' },
              { label: 'After', color: '#4FD1C5' },
            ]}
            caption={`Last ${Math.min(sessions.length, 14)} sessions`}
          >
            {/* Placeholder for actual chart - integrate with recharts */}
            <div className="h-full flex items-center justify-center text-text-disabled">
              <span className="text-meta">Chart placeholder - integrate with Recharts</span>
            </div>
          </ChartCard>

          {/* Insights Preview */}
          <div className="space-y-sm">
            <h2 className="text-section text-text-primary">Recent Insights</h2>
            <VerticalStack spacing="sm">
              {insights.map((insight) => (
                <Card
                  key={insight.id}
                  variant="default"
                  padding="default"
                  clickable
                  onClick={() => router.push('/insights')}
                  className="space-y-xs"
                >
                  <h4 className="text-meta text-text-primary font-medium">{insight.title}</h4>
                  <p className="text-meta-sm text-text-secondary">{insight.preview}</p>
                </Card>
              ))}
            </VerticalStack>
          </div>
        </VerticalStack>
      )}

      {/* Date Filter Bottom Sheet */}
      <BottomSheet
        open={dateFilterOpen}
        onOpenChange={setDateFilterOpen}
        title="Filter by Date Range"
        snapPoint="40%"
      >
        <div className="space-y-md">
          <p className="text-body text-text-secondary">
            Date range filter UI goes here (e.g., date picker, preset ranges)
          </p>
        </div>
      </BottomSheet>
    </ScreenContainer>
  );
}
