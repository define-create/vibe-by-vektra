/**
 * Zen Precision IconButton Component
 * Optimized for tap targets (min 48px)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center min-w-tap-target min-h-tap-target',
          'rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-1',
          'transition-all duration-fast ease-standard active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
