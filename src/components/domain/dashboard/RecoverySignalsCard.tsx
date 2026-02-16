'use client';

import { Card } from '@/src/components/ui/Card';
import type { WindowMetrics, WindowComparison } from '@/lib/analytics/dashboard-metrics';
import { DeltaChip } from './DeltaChip';
import { cn } from '@/lib/utils';

interface RecoverySignalsCardProps {
  metrics: WindowMetrics;
  comparison?: WindowComparison | null;
  className?: string;
}

export function RecoverySignalsCard({ metrics, comparison, className }: RecoverySignalsCardProps) {
  const sorenessAreas: Array<{
    key: keyof typeof metrics.sorenessFrequency;
    label: string;
  }> = [
    { key: 'hands', label: 'Hands' },
    { key: 'knees', label: 'Knees' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'back', label: 'Back' },
  ];

  return (
    <Card variant="default" padding="default" className={cn('space-y-md', className)}>
      <h3 className="text-body-md font-semibold text-text-primary">
        Recovery Signals
      </h3>

      <div className="grid grid-cols-2 gap-md">
        {sorenessAreas.map((area) => {
          const frequency = metrics.sorenessFrequency[area.key];
          const count = Math.round(frequency * metrics.sessionCount);
          const percentage = Math.round(frequency * 100);
          const delta = comparison?.sorenessFrequency[area.key].delta;

          return (
            <div key={area.key} className="space-y-xs">
              <p className="text-meta-sm text-text-secondary">
                {area.label}
              </p>
              <p className="text-body-md font-semibold text-text-primary">
                {count}/{metrics.sessionCount}{' '}
                <span className="text-meta-sm text-text-disabled">({percentage}%)</span>
              </p>
              {delta !== undefined && delta !== 0 && (
                <DeltaChip delta={delta} format="percentage" />
              )}
            </div>
          );
        })}
      </div>

      {comparison && (
        <p className="text-meta-xs text-text-disabled pt-xs border-t border-border">
          Frequency of sessions with soreness (vs prior period)
        </p>
      )}
    </Card>
  );
}
