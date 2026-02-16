/**
 * Journeys Page (Screen 2) - Refactored from History
 * Featured narrative + secondary grid
 * Uses real session data from local DB
 */

'use client';

import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { ScreenContainer } from '@/src/components/layout/ScreenContainer';
import { VerticalStack } from '@/src/components/layout/VerticalStack';
import { Grid2Col } from '@/src/components/layout/Grid2Col';
import { HeroJourneyCard } from '@/src/components/domain/HeroJourneyCard';
import { JourneyCardSmall } from '@/src/components/domain/JourneyCardSmall';
import { IconButton } from '@/src/components/ui/IconButton';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useSessionLogs } from '@/lib/hooks/useSessionLogs';

export default function JourneysPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const { sessions, isLoading } = useSessionLogs();

  // Create featured journey from recent sessions
  const featuredJourney = useMemo(() => {
    if (sessions.length === 0) return null;

    const shoulderSessions = sessions.filter(s => s.sorenessShoulder > 0);
    const avgShoulder = shoulderSessions.length > 0
      ? shoulderSessions.reduce((sum, s) => sum + s.sorenessShoulder, 0) / shoulderSessions.length
      : 0;

    const completionPercent = Math.round((1 - avgShoulder / 3) * 100);

    // Calculate weeks since first session
    const oldestSession = sessions[sessions.length - 1];
    const weeksSince = Math.floor(
      (new Date().getTime() - new Date(oldestSession.playedAt).getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    return {
      id: 'featured-1',
      title: 'Shoulder Recovery & Form',
      status: completionPercent > 80 ? 'completed' as const : 'in-progress' as const,
      completionPercent,
      milestones: [
        { id: 'm1', label: 'Assessment', isComplete: true },
        { id: 'm2', label: 'Pain-Free', isComplete: completionPercent > 50 },
        { id: 'm3', label: 'Full Power', isComplete: completionPercent > 80 },
      ],
      deltaText: `Started ${weeksSince} ${weeksSince === 1 ? 'week' : 'weeks'} ago`,
    };
  }, [sessions]);

  // Convert sessions to journey cards (max 8)
  const secondaryJourneys = useMemo(() => {
    return sessions.slice(0, 8).map((session) => {
      const energyDelta = session.energyAfter - session.energyBefore;
      const energyText = energyDelta > 0
        ? `+${energyDelta} energy`
        : energyDelta < 0
        ? `${energyDelta} energy`
        : 'no change';

      // Calculate completion % based on energy improvement
      const completionPercent = Math.min(100, Math.max(0,
        ((session.energyAfter / 10) * 100)
      ));

      return {
        id: session.id,
        title: new Date(session.playedAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        completionPercent: Math.round(completionPercent),
        narrative: `${session.format} • ${energyText}`,
      };
    });
  }, [sessions]);

  return (
    <ScreenContainer
      title="Journeys"
      subtitle="Your volleyball progression and sessions"
      rightActions={
        <IconButton
          icon={<Filter size={20} />}
          label="Filter journeys"
          onClick={() => setFilterOpen(true)}
        />
      }
    >
      {isLoading ? (
        <VerticalStack spacing="lg">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </VerticalStack>
      ) : sessions.length === 0 ? (
        <div className="text-center py-xl">
          <p className="text-body text-text-secondary">No sessions logged yet.</p>
          <p className="text-meta text-text-disabled mt-sm">
            Log your first session to start tracking your journey.
          </p>
        </div>
      ) : (
        <VerticalStack spacing="lg">
          {/* Featured Journey */}
          {featuredJourney && (
            <div className="space-y-sm">
              <h2 className="text-section text-text-primary">Featured Journey</h2>
              <HeroJourneyCard
                journey={featuredJourney}
                primaryCtaLabel="Continue journey →"
                onPress={() => {}}
                onPrimaryCta={() => {}}
              />
            </div>
          )}

          {/* Secondary Journeys Grid */}
          {secondaryJourneys.length > 0 && (
            <div className="space-y-sm">
              <h2 className="text-section text-text-primary">Recent Sessions</h2>
              <Grid2Col>
                {secondaryJourneys.map((journey) => (
                  <JourneyCardSmall
                    key={journey.id}
                    journey={journey}
                    onPress={() => {
                      // Future: Navigate to session detail
                      console.log('Session pressed:', journey.id);
                    }}
                  />
                ))}
              </Grid2Col>
            </div>
          )}
        </VerticalStack>
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Journeys"
        snapPoint="40%"
      >
        <div className="space-y-md">
          <div className="space-y-sm">
            <h4 className="text-meta text-text-primary font-medium">Status</h4>
            <div className="space-y-xs">
              {['In Progress', 'Completed', 'Paused'].map((status) => (
                <label key={status} className="flex items-center gap-sm">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-body text-text-secondary">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </ScreenContainer>
  );
}
