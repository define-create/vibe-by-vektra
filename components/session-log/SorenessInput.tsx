'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { SorenessLevel } from '@/types';

interface SorenessInputProps {
  hands: SorenessLevel;
  knees: SorenessLevel;
  shoulder: SorenessLevel;
  back: SorenessLevel;
  onHandsChange: (value: SorenessLevel) => void;
  onKneesChange: (value: SorenessLevel) => void;
  onShoulderChange: (value: SorenessLevel) => void;
  onBackChange: (value: SorenessLevel) => void;
}

const SORENESS_LEVELS: Array<{
  value: SorenessLevel;
  label: string;
  color: string;
}> = [
  { value: 0, label: 'None', color: 'border-border bg-secondary' },
  { value: 1, label: 'Low', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' },
  { value: 2, label: 'Moderate', color: 'border-orange-500/30 bg-orange-500/10 text-orange-500' },
  { value: 3, label: 'High', color: 'border-red-500/30 bg-red-500/10 text-red-500' },
];

const BODY_AREAS: Array<{
  key: 'hands' | 'knees' | 'shoulder' | 'back';
  label: string;
}> = [
  { key: 'hands', label: 'Hands' },
  { key: 'knees', label: 'Knees' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'back', label: 'Back' },
];

export function SorenessInput({
  hands,
  knees,
  shoulder,
  back,
  onHandsChange,
  onKneesChange,
  onShoulderChange,
  onBackChange,
}: SorenessInputProps) {
  const values = { hands, knees, shoulder, back };
  const handlers = {
    hands: onHandsChange,
    knees: onKneesChange,
    shoulder: onShoulderChange,
    back: onBackChange,
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">Soreness</Label>

      <div className="space-y-3">
        {BODY_AREAS.map((area) => (
          <div key={area.key} className="space-y-2">
            <span className="text-sm text-muted-foreground">{area.label}</span>
            <div className="grid grid-cols-4 gap-2">
              {SORENESS_LEVELS.map((level) => (
                <button
                  key={`${area.key}-${level.value}`}
                  type="button"
                  onClick={() => handlers[area.key](level.value)}
                  className={cn(
                    'h-10 rounded-lg border-2 transition-all text-sm font-medium',
                    'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring',
                    values[area.key] === level.value
                      ? level.color
                      : 'border-border bg-secondary text-muted-foreground'
                  )}
                  aria-label={`${area.label} ${level.label}`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
