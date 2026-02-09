'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReflectionTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 500;

export function ReflectionTextarea({ value, onChange }: ReflectionTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reflection">
        Notes <span className="text-muted-foreground text-sm font-normal">(optional, private)</span>
      </Label>
      <Textarea
        id="reflection"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any observations for yourself..."
        maxLength={MAX_LENGTH}
        rows={3}
        className="resize-none"
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length} / {MAX_LENGTH}
      </div>
    </div>
  );
}
