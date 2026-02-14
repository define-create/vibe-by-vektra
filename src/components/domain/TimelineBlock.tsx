/**
 * TimelineBlock - Timeline item for guided narrative
 * Variants: evidence (neutral), callout (accent bar), guidance (subtle icon)
 * Left timeline rail + marker; right content card
 * On-scroll reveal: fade + translateY
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/lib/utils';

interface TimelineBlockProps {
  item: {
    variant: 'evidence' | 'callout' | 'guidance';
    timestampLabel?: string;
    title?: string;
    body: string;
    series?: Array<{ label: string; value: string }>;
  };
  className?: string;
}

export function TimelineBlock({ item, className }: TimelineBlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const cardVariant = item.variant === 'callout' ? 'callout' : 'default';

  return (
    <motion.div
      ref={ref}
      className={cn('flex gap-md', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {/* Left Timeline Rail */}
      <div className="flex flex-col items-center gap-sm pt-sm">
        {/* Marker */}
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            item.variant === 'callout' ? 'bg-accent-primary' : 'bg-surface-3'
          )}
        />
        {/* Rail */}
        <div className="flex-1 w-[2px] bg-divider min-h-[60px]" />
      </div>

      {/* Right Content Card */}
      <div className="flex-1 pb-md">
        <Card variant={cardVariant} padding="default" className="space-y-sm">
          {/* Timestamp */}
          {item.timestampLabel && (
            <span className="text-meta-sm text-text-disabled">{item.timestampLabel}</span>
          )}

          {/* Title */}
          {item.title && (
            <div className="flex items-start gap-sm">
              {item.variant === 'guidance' && (
                <Info size={16} className="text-accent-primary mt-1 flex-shrink-0" />
              )}
              <h4 className="text-section text-text-primary">{item.title}</h4>
            </div>
          )}

          {/* Body */}
          <p className="text-body text-text-secondary">{item.body}</p>

          {/* Series Data (if provided) */}
          {item.series && item.series.length > 0 && (
            <div className="grid grid-cols-2 gap-md pt-sm">
              {item.series.map((data, index) => (
                <div key={index} className="space-y-xs">
                  <span className="text-meta-sm text-text-disabled">{data.label}</span>
                  <span className="text-meta text-text-primary font-medium block">
                    {data.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
