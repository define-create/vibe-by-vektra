/**
 * Zen Precision Button Component
 * Variants: primary (accent fill), secondary (subtle), ghost
 */

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-sm whitespace-nowrap rounded-lg text-meta font-medium transition-all duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-accent-primary text-bg-primary hover:bg-accent-primary/90',
        secondary: 'bg-surface-2 text-text-primary hover:bg-surface-3 border border-divider',
        ghost: 'text-text-primary hover:bg-surface-1',
        destructive: 'bg-semantic-alert text-bg-primary hover:bg-semantic-alert/90',
      },
      size: {
        default: 'h-10 px-md',
        sm: 'h-9 px-sm text-meta-sm',
        lg: 'min-h-tap-target px-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
