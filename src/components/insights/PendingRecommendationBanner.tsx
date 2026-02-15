/**
 * Pending Recommendation Banner
 * Prompts user for feedback on recommendations they planned to follow
 * Week 2 feature: feedback loop completion tracking
 */

'use client';

import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { clearPendingRecommendation, type PendingRecommendation } from '@/lib/insights/recommendation-tracker';

export interface PendingRecommendationBannerProps {
  recommendation: PendingRecommendation;
  onDone: () => void;
  onSkip: () => void;
  className?: string;
}

export function PendingRecommendationBanner({
  recommendation,
  onDone,
  onSkip,
  className,
}: PendingRecommendationBannerProps) {
  const handleDone = () => {
    // Don't clear localStorage here - Dashboard will do it after checking outcome
    // Just notify parent to hide the banner
    onDone();
  };

  const handleSkip = () => {
    // Clear localStorage when user explicitly skips the recommendation
    clearPendingRecommendation();
    onSkip();
  };

  return (
    <Card
      variant="callout"
      padding="default"
      className={className}
    >
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1">
          <h4 className="text-meta text-text-primary font-medium">
            Quick follow-up
          </h4>
          <p className="text-meta-sm text-text-secondary mt-xs">
            Last time you planned to {recommendation.label.toLowerCase()}. How did it go?
          </p>
        </div>

        <div className="flex gap-sm flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-text-secondary"
          >
            Skipped
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}
