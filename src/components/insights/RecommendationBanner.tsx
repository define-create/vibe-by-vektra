/**
 * Recommendation Banner (Option 4: Outcome-First Design)
 * Shows once on Dashboard, auto-dismisses after 5 seconds
 * Focuses on the outcome promise rather than the action
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/src/components/ui/Card';
import { Lightbulb } from 'lucide-react';
import type { PendingRecommendation } from '@/lib/insights/recommendation-tracker';

const AUTO_DISMISS_MS = 5000; // 5 seconds

interface RecommendationBannerProps {
  recommendation: PendingRecommendation;
  onDismiss: () => void; // Called when auto-dismissed or manually closed
}

export function RecommendationBanner({
  recommendation,
  onDismiss,
}: RecommendationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade animation to complete before calling onDismiss
      setTimeout(onDismiss, 300);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Generate outcome-focused copy based on recommendation type
  const getOutcomeCopy = () => {
    const type = recommendation.type;
    const label = recommendation.label.toLowerCase();

    if (type === 'consistency' || label.includes('note')) {
      return "When you add notes consistently, we'll show you insights about your patterns.";
    }
    if (type === 'intensity' || label.includes('intensity')) {
      return "When you adjust your intensity, we'll track the impact on recovery.";
    }
    if (type === 'recovery' || label.includes('recovery') || label.includes('soreness')) {
      return "When you focus on recovery, we'll measure improvements over time.";
    }
    return "We'll track your progress and show you the impact.";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            variant="default"
            padding="compact"
            className="border-l-4 border-accent-primary bg-accent-primary/5"
          >
            <div className="flex items-start gap-sm">
              <Lightbulb size={18} className="text-accent-primary flex-shrink-0 mt-xs" />
              <div className="flex-1">
                <p className="text-meta text-text-primary font-medium">
                  Tracking: {recommendation.label}
                </p>
                <p className="text-meta-sm text-text-secondary mt-xs">
                  {getOutcomeCopy()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
