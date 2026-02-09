'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MoodEnergyInputProps {
  label: string;
  beforeValue: number;
  afterValue: number;
  onBeforeChange: (value: number) => void;
  onAfterChange: (value: number) => void;
  beforeLabel?: string;
  afterLabel?: string;
}

export function MoodEnergyInput({
  label,
  beforeValue,
  afterValue,
  onBeforeChange,
  onAfterChange,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: MoodEnergyInputProps) {
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-3">
      <Label className="text-base">{label}</Label>

      <div className="space-y-3">
        {/* Before Session */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground min-w-[60px]">
            {beforeLabel}
          </span>
          <div className="flex gap-2">
            {levels.map((level) => (
              <button
                key={`before-${level}`}
                type="button"
                onClick={() => onBeforeChange(level)}
                className={cn(
                  'h-11 w-11 rounded-lg border-2 transition-all',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                  beforeValue === level
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-muted-foreground'
                )}
                aria-label={`${beforeLabel} ${level}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* After Session */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground min-w-[60px]">
            {afterLabel}
          </span>
          <div className="flex gap-2">
            {levels.map((level) => (
              <button
                key={`after-${level}`}
                type="button"
                onClick={() => onAfterChange(level)}
                className={cn(
                  'h-11 w-11 rounded-lg border-2 transition-all',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                  afterValue === level
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-muted-foreground'
                )}
                aria-label={`${afterLabel} ${level}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Show delta */}
      {beforeValue > 0 && afterValue > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {afterValue > beforeValue && `+${afterValue - beforeValue}`}
          {afterValue < beforeValue && `${afterValue - beforeValue}`}
          {afterValue === beforeValue && '→'}
        </div>
      )}
    </div>
  );
}
