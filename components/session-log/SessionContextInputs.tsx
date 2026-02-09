'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { IntensityLevel, SessionFormat, Environment } from '@/types';

interface SessionContextInputsProps {
  intensity: IntensityLevel;
  format: SessionFormat;
  environment: Environment;
  durationMinutes?: number;
  onIntensityChange: (value: IntensityLevel) => void;
  onFormatChange: (value: SessionFormat) => void;
  onEnvironmentChange: (value: Environment) => void;
  onDurationChange: (value: number | undefined) => void;
}

export function SessionContextInputs({
  intensity,
  format,
  environment,
  durationMinutes,
  onIntensityChange,
  onFormatChange,
  onEnvironmentChange,
  onDurationChange,
}: SessionContextInputsProps) {
  return (
    <div className="space-y-4">
      {/* Intensity */}
      <div className="space-y-2">
        <Label>Intensity</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['casual', 'moderate', 'competitive'] as IntensityLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onIntensityChange(level)}
              className={cn(
                'h-10 rounded-lg border-2 transition-all text-sm font-medium capitalize',
                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                intensity === level
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-muted-foreground'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Format & Environment */}
      <div className="grid grid-cols-2 gap-4">
        {/* Format */}
        <div className="space-y-2">
          <Label>Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['singles', 'doubles'] as SessionFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFormatChange(f)}
                className={cn(
                  'h-10 rounded-lg border-2 transition-all text-sm font-medium capitalize',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                  format === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-muted-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div className="space-y-2">
          <Label>Environment</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['indoor', 'outdoor'] as Environment[]).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => onEnvironmentChange(env)}
                className={cn(
                  'h-10 rounded-lg border-2 transition-all text-sm font-medium capitalize',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                  environment === env
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-muted-foreground'
                )}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes, optional)</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          max={300}
          value={durationMinutes ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            onDurationChange(val ? parseInt(val, 10) : undefined);
          }}
          placeholder="e.g., 60"
          className="max-w-[150px]"
        />
      </div>
    </div>
  );
}
