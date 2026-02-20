'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Confidence } from '@/types';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  title: string;
  observationText: string;
  confidence: Confidence;
  evidenceSummary?: string;
  metrics?: Record<string, unknown>;
}

export function InsightCard({
  title,
  observationText,
  confidence,
  evidenceSummary,
  metrics,
}: InsightCardProps) {
  const confidenceColors = {
    low: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    high: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-base leading-snug flex-1">
          {title}
        </h3>
        <Badge
          variant="outline"
          className={cn(
            'capitalize shrink-0',
            confidenceColors[confidence]
          )}
        >
          {confidence}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {observationText}
      </p>

      {evidenceSummary && (
        <p className="text-xs text-muted-foreground/80 pt-2 border-t">
          {evidenceSummary}
        </p>
      )}

      {metrics && Object.keys(metrics).length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-2">
            {Object.entries(metrics).map(([key, value]) => (
              <span
                key={key}
                className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
              >
                {key}: <span className="font-medium">{String(value)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
