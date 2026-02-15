/**
 * Outcome Card - Option 4: Outcome-First Design
 * Prominent, celebratory card with detailed stats
 * Shows when user successfully follows a recommendation
 */

'use client';

import { motion } from 'framer-motion';
import { X, ArrowRight, TrendingUp } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { IconButton } from '@/src/components/ui/IconButton';
import type { LocalRecommendationOutcome } from '@/lib/db/local-db';

interface OutcomeCardProps {
  outcome: LocalRecommendationOutcome;
  onDismiss: () => void;
  onCtaClick?: () => void;
}

export function OutcomeCard({ outcome, onDismiss, onCtaClick }: OutcomeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="elevated"
        padding="default"
        className="relative border-2 border-accent-primary/20 bg-gradient-to-br from-accent-primary/5 to-transparent"
      >
        {/* Dismiss button */}
        {outcome.dismissible && (
          <IconButton
            icon={<X size={16} />}
            label="Dismiss"
            onClick={onDismiss}
            className="absolute top-sm right-sm"
          />
        )}

        {/* Celebratory header */}
        <div className="flex items-start gap-sm mb-sm">
          <div className="p-sm rounded-lg bg-accent-primary/10">
            <TrendingUp size={20} className="text-accent-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-section text-accent-primary font-semibold">
              {outcome.title}
            </h3>
          </div>
        </div>

        {/* Body text */}
        <p className="text-body text-text-secondary mb-md">
          {outcome.body}
        </p>

        {/* CTA button */}
        {outcome.ctaLabel && (
          <Button
            variant="secondary"
            size="default"
            onClick={onCtaClick}
            className="w-full sm:w-auto"
          >
            {outcome.ctaLabel}
            <ArrowRight size={16} className="ml-xs" />
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
