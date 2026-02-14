/**
 * ChartCard - Chart container with title, legend, and fixed height
 * Reserves space to prevent layout shift
 */

'use client';

import { Card } from '@/src/components/ui/Card';
import { cn } from '@/lib/utils';

interface ChartLegendItem {
  label: string;
  color: string;
}

interface ChartCardProps {
  title: string;
  legend?: ChartLegendItem[];
  caption?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, legend, caption, children, className }: ChartCardProps) {
  return (
    <Card variant="default" padding="default" className={cn('space-y-md', className)}>
      {/* Title Row + Legend */}
      <div className="flex items-start justify-between gap-md">
        <h3 className="text-section text-text-primary">{title}</h3>
        {legend && legend.length > 0 && (
          <div className="flex items-center gap-md">
            {legend.map((item, index) => (
              <div key={index} className="flex items-center gap-xs">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-meta-sm text-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart Area - Fixed Height */}
      <div className="h-[200px] w-full">{children}</div>

      {/* Optional Caption */}
      {caption && <p className="text-meta-sm text-text-secondary">{caption}</p>}
    </Card>
  );
}
