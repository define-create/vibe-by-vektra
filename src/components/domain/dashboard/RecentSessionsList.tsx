'use client';

import { Card } from '@/src/components/ui/Card';
import type { LocalSessionLog } from '@/lib/db/local-db';
import { cn } from '@/lib/utils';

interface RecentSessionsListProps {
  sessions: LocalSessionLog[];
  className?: string;
}

export function RecentSessionsList({ sessions, className }: RecentSessionsListProps) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-sm', className)}>
      <h3 className="text-body-md font-semibold text-text-primary">
        Recent Sessions
      </h3>

      <div className="space-y-xs">
        {sessions.map((session) => {
          const date = new Date(session.playedAt);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          });

          const energyDelta = session.energyAfter - session.energyBefore;
          const energySign = energyDelta >= 0 ? '+' : '';

          // Check for soreness
          const hasSoreness =
            session.sorenessHands > 0 ||
            session.sorenessKnees > 0 ||
            session.sorenessShoulder > 0 ||
            session.sorenessBack > 0;

          return (
            <Card
              key={session.id}
              variant="default"
              padding="default"
              className="hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center justify-between gap-md">
                {/* Date & Time */}
                <div className="flex-shrink-0">
                  <p className="text-body-sm font-medium text-text-primary">
                    {dateStr}
                  </p>
                  <p className="text-meta-xs text-text-disabled">
                    {timeStr}
                  </p>
                </div>

                {/* Session Info */}
                <div className="flex-1 flex items-center gap-xs flex-wrap">
                  <span className="text-meta-sm text-text-secondary px-xs py-xxs bg-surface-2 rounded-sm capitalize">
                    {session.format}
                  </span>
                  <span className="text-meta-sm text-text-secondary px-xs py-xxs bg-surface-2 rounded-sm capitalize">
                    {session.intensity}
                  </span>
                </div>

                {/* Energy & Soreness */}
                <div className="flex items-center gap-md flex-shrink-0">
                  <div className="text-right">
                    <p className="text-body-sm font-semibold text-text-primary">
                      {energySign}{energyDelta.toFixed(1)}
                    </p>
                    <p className="text-meta-xs text-text-disabled">
                      Energy
                    </p>
                  </div>

                  {hasSoreness && (
                    <div className="w-2 h-2 rounded-full bg-semantic-warning" title="Has soreness" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
