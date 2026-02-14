/**
 * HeroJourneyCard - Featured journey card with progress animation
 * Top: Journey title + status badge + completion %
 * Center: Progress visualization with milestone dots
 * Bottom: Delta text + CTA row
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  label: string;
  isComplete: boolean;
}

interface HeroJourneyCardProps {
  journey: {
    id: string;
    title: string;
    status: 'in-progress' | 'completed' | 'paused';
    completionPercent: number;
    milestones?: Milestone[];
    deltaText?: string;
  };
  primaryCtaLabel?: string;
  onPress?: () => void;
  onPrimaryCta?: () => void;
  className?: string;
}

export function HeroJourneyCard({
  journey,
  primaryCtaLabel = 'Continue journey',
  onPress,
  onPrimaryCta,
  className,
}: HeroJourneyCardProps) {
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    // Trigger progress animation on mount
    const timer = setTimeout(() => setAnimateProgress(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const statusVariant =
    journey.status === 'completed'
      ? 'success'
      : journey.status === 'in-progress'
      ? 'accent'
      : 'default';

  return (
    <Card
      variant="elevated"
      padding="hero"
      clickable={!!onPress}
      onClick={onPress}
      className={cn('space-y-lg', className)}
      asMotion
    >
      {/* Top Row: Title + Status + Completion */}
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1 space-y-sm">
          <h3 className="text-title text-text-primary">{journey.title}</h3>
          <Badge variant={statusVariant}>
            {journey.status === 'in-progress' ? 'In Progress' : journey.status}
          </Badge>
        </div>
        <div className="text-title text-accent-primary font-semibold">
          {journey.completionPercent}%
        </div>
      </div>

      {/* Center: Progress Visualization */}
      <div className="space-y-md">
        {/* Progress Bar */}
        <div className="relative h-2 bg-surface-3 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent-primary rounded-full"
            initial={{ width: 0 }}
            animate={animateProgress ? { width: `${journey.completionPercent}%` } : {}}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        {/* Milestone Dots (if provided) */}
        {journey.milestones && journey.milestones.length > 0 && (
          <div className="flex items-center justify-between gap-xs">
            {journey.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                className="flex flex-col items-center gap-xs flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={animateProgress ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.22,
                  delay: 0.6 + index * 0.1,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                <motion.div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    milestone.isComplete ? 'bg-accent-primary' : 'bg-surface-3'
                  )}
                  animate={
                    milestone.isComplete && index === journey.milestones!.length - 1
                      ? {
                          scale: [1, 1.3, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.4,
                    delay: 0.9 + index * 0.1,
                  }}
                />
                <span className="text-meta-sm text-text-secondary text-center line-clamp-2">
                  {milestone.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Delta + CTA */}
      <div className="flex items-center justify-between gap-md pt-md border-t border-divider">
        {journey.deltaText ? (
          <span className="text-meta text-text-secondary">{journey.deltaText}</span>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          size="default"
          onClick={(e) => {
            e.stopPropagation();
            onPrimaryCta?.();
          }}
        >
          {primaryCtaLabel}
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}
