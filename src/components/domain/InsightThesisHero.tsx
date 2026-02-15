/**
 * Insight Thesis Hero Card
 * Displays the main thesis statement with key metric and context
 * Week 2 feature: visual foundation for rule-based insights
 */

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import type { ThesisData, DeltaDirection } from '@/lib/insights/rule-based-generator';
import { fadeIn } from '@/src/tokens/motion';

export interface InsightThesisHeroProps {
  thesis: ThesisData;
  className?: string;
}

export function InsightThesisHero({ thesis, className }: InsightThesisHeroProps) {
  const deltaVariant = getDeltaVariant(thesis.metricDelta);
  const deltaIcon = getDeltaIcon(thesis.metricDelta);
  const deltaCopy = getDeltaCopy(thesis.metricDelta);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={className}
    >
      <Card variant="elevated" padding="hero">
        <div className="space-y-md">
          {/* Thesis statement */}
          <h2 className="text-title text-text-primary leading-tight">
            {thesis.title}
          </h2>

          {/* Key metric row */}
          <div className="flex items-end gap-md">
            <div className="flex items-baseline gap-xs">
              <span className="text-display text-accent-primary font-semibold">
                {thesis.metricValue}
              </span>
              <span className="text-meta text-text-secondary">
                {thesis.metricLabel}
              </span>
            </div>

            {thesis.metricDelta && (
              <Badge variant={deltaVariant} className="mb-1">
                <span className="flex items-center gap-xs">
                  {deltaIcon}
                  {deltaCopy}
                </span>
              </Badge>
            )}
          </div>

          {/* Context */}
          <p className="text-meta text-text-disabled">
            {thesis.context}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDeltaVariant(delta?: DeltaDirection): 'success' | 'warning' | 'default' {
  if (!delta) return 'default';
  if (delta === 'up') return 'success';
  if (delta === 'down') return 'warning';
  return 'default';
}

function getDeltaIcon(delta?: DeltaDirection): JSX.Element | null {
  if (!delta) return null;
  if (delta === 'up') return <TrendingUp size={14} />;
  if (delta === 'down') return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

function getDeltaCopy(delta?: DeltaDirection): string {
  if (!delta) return '';
  if (delta === 'up') return 'Improving';
  if (delta === 'down') return 'Declining';
  return 'Stable';
}
