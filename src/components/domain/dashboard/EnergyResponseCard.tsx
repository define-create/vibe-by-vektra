'use client';

import { Card } from '@/src/components/ui/Card';
import type { WindowMetrics, WindowComparison } from '@/lib/analytics/dashboard-metrics';
import { DeltaChip } from './DeltaChip';
import { cn } from '@/lib/utils';

interface EnergyResponseCardProps {
  metrics: WindowMetrics;
  comparison?: WindowComparison | null;
  className?: string;
}

export function EnergyResponseCard({ metrics, comparison, className }: EnergyResponseCardProps) {
  const energyMetrics = [
    {
      label: 'Before',
      value: metrics.avgEnergyBefore.toFixed(1),
      delta: comparison?.energy.before.delta,
    },
    {
      label: 'After',
      value: metrics.avgEnergyAfter.toFixed(1),
      delta: comparison?.energy.after.delta,
    },
    {
      label: 'Delta',
      value: metrics.avgEnergyDelta >= 0 ? `+${metrics.avgEnergyDelta.toFixed(1)}` : metrics.avgEnergyDelta.toFixed(1),
      delta: comparison?.energy.delta.delta,
    },
  ];

  return (
    <Card variant="default" padding="default" className={cn('space-y-md', className)}>
      <h3 className="text-body-md font-semibold text-text-primary">
        Energy Response
      </h3>

      <div className="grid grid-cols-3 gap-md">
        {energyMetrics.map((metric) => (
          <div key={metric.label} className="space-y-xs">
            <p className="text-meta-sm text-text-secondary">
              {metric.label}
            </p>
            <p className="text-display-xs font-semibold text-text-primary">
              {metric.value}
            </p>
            {metric.delta !== undefined && metric.delta !== 0 && (
              <DeltaChip delta={metric.delta} format="decimal" />
            )}
          </div>
        ))}
      </div>

      {comparison && (
        <p className="text-meta-xs text-text-disabled pt-xs border-t border-border">
          Compared to prior period
        </p>
      )}
    </Card>
  );
}
