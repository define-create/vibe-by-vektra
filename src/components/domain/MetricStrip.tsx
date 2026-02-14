/**
 * MetricStrip - 3 equal columns with metrics
 * Large values, muted labels, semantic colored deltas
 */

'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string | number;
  delta?: string | number;
  deltaDirection?: 'up' | 'down' | 'neutral';
}

interface MetricStripProps {
  metrics: [Metric, Metric, Metric]; // Expect exactly 3
  className?: string;
}

export function MetricStrip({ metrics, className }: MetricStripProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-md', className)}>
      {metrics.map((metric, index) => (
        <div key={index} className="flex flex-col gap-xs">
          <span className="text-meta-sm text-text-secondary">{metric.label}</span>
          <span className="text-title text-text-primary font-semibold">{metric.value}</span>
          {metric.delta !== undefined && (
            <div
              className={cn(
                'flex items-center gap-xs text-meta-sm',
                metric.deltaDirection === 'up' && 'text-semantic-success',
                metric.deltaDirection === 'down' && 'text-semantic-alert',
                metric.deltaDirection === 'neutral' && 'text-text-secondary'
              )}
            >
              {metric.deltaDirection === 'up' && <TrendingUp size={14} />}
              {metric.deltaDirection === 'down' && <TrendingDown size={14} />}
              <span>{metric.delta}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
