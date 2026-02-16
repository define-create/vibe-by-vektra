'use client';

import { Card } from '@/src/components/ui/Card';
import type { WindowMetrics } from '@/lib/analytics/dashboard-metrics';
import { cn } from '@/lib/utils';

interface ContextComparisonsCardProps {
  metrics: WindowMetrics;
  sampleSizeSupported: boolean;
  className?: string;
}

export function ContextComparisonsCard({
  metrics,
  sampleSizeSupported,
  className
}: ContextComparisonsCardProps) {
  if (!sampleSizeSupported) {
    return (
      <Card variant="default" padding="default" className={cn('space-y-sm', className)}>
        <h3 className="text-body-md font-semibold text-text-primary">
          Context Comparisons
        </h3>
        <div className="py-lg">
          <p className="text-body-sm text-text-secondary text-center">
            Log 3+ singles and 3+ doubles to compare formats
          </p>
        </div>
      </Card>
    );
  }

  const { byFormat, byIntensity } = metrics;

  const formatComparisons = byFormat && byFormat.singles && byFormat.doubles;
  const intensityComparisons = byIntensity;

  return (
    <div className={cn('space-y-md', className)}>
      {/* Singles vs Doubles */}
      {formatComparisons && (
        <Card variant="default" padding="default" className="space-y-md">
          <h4 className="text-body-md font-semibold text-text-primary">
            Singles vs Doubles
          </h4>

          <div className="grid grid-cols-2 gap-md">
            {/* Singles */}
            <div className="space-y-xs">
              <p className="text-meta-sm text-text-secondary">
                Singles ({byFormat.singles!.count} sessions)
              </p>
              <div className="space-y-xxs">
                <p className="text-body-sm text-text-primary">
                  <span className="font-medium">Energy Δ:</span>{' '}
                  {byFormat.singles!.avgEnergyDelta >= 0 ? '+' : ''}
                  {byFormat.singles!.avgEnergyDelta.toFixed(1)}
                </p>
                <p className="text-body-sm text-text-primary">
                  <span className="font-medium">Soreness:</span>{' '}
                  {Math.round(byFormat.singles!.avgSorenessFreq * 100)}%
                </p>
              </div>
            </div>

            {/* Doubles */}
            <div className="space-y-xs">
              <p className="text-meta-sm text-text-secondary">
                Doubles ({byFormat.doubles!.count} sessions)
              </p>
              <div className="space-y-xxs">
                <p className="text-body-sm text-text-primary">
                  <span className="font-medium">Energy Δ:</span>{' '}
                  {byFormat.doubles!.avgEnergyDelta >= 0 ? '+' : ''}
                  {byFormat.doubles!.avgEnergyDelta.toFixed(1)}
                </p>
                <p className="text-body-sm text-text-primary">
                  <span className="font-medium">Soreness:</span>{' '}
                  {Math.round(byFormat.doubles!.avgSorenessFreq * 100)}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Intensity Breakdown */}
      {intensityComparisons && (
        <Card variant="default" padding="default" className="space-y-md">
          <h4 className="text-body-md font-semibold text-text-primary">
            Intensity Breakdown
          </h4>

          <div className="space-y-sm">
            {byIntensity.casual && byIntensity.casual.count >= 3 && (
              <div className="flex items-center justify-between">
                <div className="space-y-xxs flex-1">
                  <p className="text-meta-sm text-text-secondary">
                    Casual ({byIntensity.casual.count})
                  </p>
                  <p className="text-body-sm text-text-primary font-medium">
                    Energy Δ: {byIntensity.casual.avgEnergyDelta >= 0 ? '+' : ''}
                    {byIntensity.casual.avgEnergyDelta.toFixed(1)}
                  </p>
                </div>
              </div>
            )}

            {byIntensity.moderate && byIntensity.moderate.count >= 3 && (
              <div className="flex items-center justify-between">
                <div className="space-y-xxs flex-1">
                  <p className="text-meta-sm text-text-secondary">
                    Moderate ({byIntensity.moderate.count})
                  </p>
                  <p className="text-body-sm text-text-primary font-medium">
                    Energy Δ: {byIntensity.moderate.avgEnergyDelta >= 0 ? '+' : ''}
                    {byIntensity.moderate.avgEnergyDelta.toFixed(1)}
                  </p>
                </div>
              </div>
            )}

            {byIntensity.competitive && byIntensity.competitive.count >= 3 && (
              <div className="flex items-center justify-between">
                <div className="space-y-xxs flex-1">
                  <p className="text-meta-sm text-text-secondary">
                    Competitive ({byIntensity.competitive.count})
                  </p>
                  <p className="text-body-sm text-text-primary font-medium">
                    Energy Δ: {byIntensity.competitive.avgEnergyDelta >= 0 ? '+' : ''}
                    {byIntensity.competitive.avgEnergyDelta.toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
