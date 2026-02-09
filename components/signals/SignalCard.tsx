'use client';

import { SupportingInput } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface SignalCardProps {
  signal: SupportingInput;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

export function SignalCard({ signal, onEdit, onDelete, onToggle }: SignalCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-base">{signal.name}</h3>
            {signal.seededPreloaded && (
              <Badge variant="outline" className="text-xs">
                Default
              </Badge>
            )}
          </div>

          {signal.description && (
            <p className="text-sm text-muted-foreground">{signal.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={signal.isEnabled}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${signal.name}`}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {!signal.seededPreloaded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
