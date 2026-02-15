/**
 * Insight Actions Card
 * Displays recommended actions based on rule-based insights
 * Week 2 feature: actionable feedback loop
 */

'use client';

import { ChevronRight } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { VerticalStack } from '@/src/components/layout/VerticalStack';
import { setPendingRecommendation, type RecommendationType } from '@/lib/insights/recommendation-tracker';

export interface ActionItem {
  id: string;
  label: string;
  hint?: string;
}

export interface InsightActionsCardProps {
  actions: ActionItem[];
  className?: string;
  onActionClick?: (actionId: string) => void;
}

export function InsightActionsCard({
  actions,
  className,
  onActionClick,
}: InsightActionsCardProps) {
  const handleActionClick = (action: ActionItem) => {
    console.log('[InsightActionsCard] Action clicked:', action.id, action.label);

    // Determine recommendation type from action id
    const type = inferRecommendationType(action.id);
    console.log('[InsightActionsCard] Inferred type:', type);

    // Set pending recommendation for feedback loop
    console.log('[InsightActionsCard] Setting pending recommendation...');
    setPendingRecommendation(action.id, type, action.label);

    // Verify it was saved
    const saved = localStorage.getItem('vibe_pending_recommendation');
    console.log('[InsightActionsCard] Saved to localStorage:', saved);

    // Call optional callback
    if (onActionClick) {
      onActionClick(action.id);
    }
  };

  return (
    <Card variant="elevated" padding="default" className={className}>
      <h3 className="text-section text-text-primary mb-md">
        Recommended Actions
      </h3>

      <VerticalStack spacing="xs">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex items-center justify-between min-h-tap-target px-md py-sm rounded-lg hover:bg-surface-1 active:bg-surface-2 transition-colors text-left"
          >
            <div className="flex-1">
              <p className="text-meta text-text-primary font-medium">
                {action.label}
              </p>
              {action.hint && (
                <p className="text-meta-sm text-text-secondary mt-xs">
                  {action.hint}
                </p>
              )}
            </div>
            <ChevronRight
              size={20}
              className="text-text-disabled flex-shrink-0 ml-sm"
            />
          </button>
        ))}
      </VerticalStack>
    </Card>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function inferRecommendationType(actionId: string): RecommendationType {
  const id = actionId.toLowerCase();

  if (id.includes('intensity') || id.includes('adjust')) {
    return 'intensity';
  }

  if (id.includes('consistency') || id.includes('goal') || id.includes('frequency')) {
    return 'consistency';
  }

  if (id.includes('recovery') || id.includes('soreness') || id.includes('rest')) {
    return 'recovery';
  }

  // Default to consistency as it's the most common recommendation type
  return 'consistency';
}
