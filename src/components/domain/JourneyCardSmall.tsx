/**
 * JourneyCardSmall - Compact journey card for 2-col grid
 * Title (max 2 lines), mini progress bar, 1-line narrative
 */

'use client';

import { Card } from '@/src/components/ui/Card';
import { cn } from '@/lib/utils';

interface JourneyCardSmallProps {
  journey: {
    id: string;
    title: string;
    completionPercent: number;
    narrative?: string;
  };
  onPress?: () => void;
  className?: string;
}

export function JourneyCardSmall({ journey, onPress, className }: JourneyCardSmallProps) {
  return (
    <Card
      variant="default"
      padding="default"
      clickable={!!onPress}
      onClick={onPress}
      className={cn('space-y-sm', className)}
      asMotion
    >
      {/* Title */}
      <h4 className="text-section text-text-primary line-clamp-2">{journey.title}</h4>

      {/* Mini Progress Bar */}
      <div className="relative h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent-primary rounded-full transition-all duration-slow"
          style={{ width: `${journey.completionPercent}%` }}
        />
      </div>

      {/* Narrative */}
      {journey.narrative && (
        <p className="text-meta-sm text-text-secondary line-clamp-1">{journey.narrative}</p>
      )}
    </Card>
  );
}
