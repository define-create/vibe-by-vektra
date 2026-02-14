/**
 * Zen Precision Skeleton Loader
 * Soft shimmer, low contrast, reserves space
 */

'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-2',
        className
      )}
    />
  );
}

// Add shimmer animation to globals.css
