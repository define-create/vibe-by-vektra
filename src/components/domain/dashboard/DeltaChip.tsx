'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeltaChipProps {
  delta: number;
  format?: 'decimal' | 'percentage';
  showSign?: boolean;
  className?: string;
}

export function DeltaChip({
  delta,
  format = 'decimal',
  showSign = true,
  className
}: DeltaChipProps) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = delta === 0;

  // Format the value
  let displayValue = '';
  if (format === 'percentage') {
    displayValue = `${Math.round(delta * 100)}%`;
  } else {
    displayValue = Math.abs(delta).toFixed(1);
  }

  // Add sign
  const sign = showSign ? (isPositive ? '+' : isNegative ? '−' : '') : '';
  const arrow = isPositive ? '↑' : isNegative ? '↓' : '';

  return (
    <Badge
      variant="default"
      className={cn(
        'text-meta-xs font-medium gap-1',
        isNeutral && 'text-text-disabled',
        className
      )}
    >
      {arrow && <span className="text-text-secondary">{arrow}</span>}
      <span>
        {sign}{displayValue}
      </span>
    </Badge>
  );
}
