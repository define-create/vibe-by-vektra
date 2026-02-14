/**
 * Zen Precision Badge Component
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-sm py-xs text-meta-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-text-secondary',
        accent: 'bg-accent-primary/10 text-accent-primary',
        success: 'bg-semantic-success/10 text-semantic-success',
        warning: 'bg-semantic-warning/10 text-semantic-warning',
        alert: 'bg-semantic-alert/10 text-semantic-alert',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
