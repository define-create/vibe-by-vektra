'use client';

import { InsightArtifact } from '@/types';
import { InsightCard } from './InsightCard';

interface InsightsListProps {
  insights: InsightArtifact[];
  runDate?: string;
  sessionsCount?: number;
}

export function InsightsList({
  insights,
  runDate,
  sessionsCount,
}: InsightsListProps) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No insights yet. Generate your first insight to see patterns in your
          sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {runDate && (
        <div className="text-sm text-muted-foreground">
          {new Date(runDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          {sessionsCount && ` • ${sessionsCount} sessions analyzed`}
        </div>
      )}

      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            title={insight.title}
            observationText={insight.observationText}
            confidence={insight.confidence}
            evidenceSummary={insight.evidenceSummary}
            metrics={insight.metrics}
          />
        ))}
      </div>
    </div>
  );
}
