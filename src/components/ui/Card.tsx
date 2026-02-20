/**
 * Zen Precision Card Component
 * Variants: default (surface.1), elevated (surface.2), callout (surface.3 + accent bar)
 */

'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'relative overflow-hidden transition-all duration-base ease-standard',
  {
    variants: {
      variant: {
        default: 'bg-surface-1',
        elevated: 'bg-surface-2',
        callout: 'bg-surface-3 border-l-2 border-accent-primary',
      },
      padding: {
        none: '',
        default: 'p-md',
        hero: 'p-[20px]',
      },
      radius: {
        default: 'rounded-lg',
        md: 'rounded-md',
        sm: 'rounded-sm',
      },
      clickable: {
        true: 'cursor-pointer active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      radius: 'default',
      clickable: false,
    },
  }
);

export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
    VariantProps<typeof cardVariants> {
  asMotion?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      radius,
      clickable,
      asMotion = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;

    // Add press overlay for clickable cards
    const pressOverlay = isClickable && (
      <div className="absolute inset-0 bg-overlay-press opacity-0 active:opacity-100 transition-opacity duration-fast pointer-events-none" />
    );

    const commonProps = {
      ref: ref as React.Ref<HTMLDivElement>,
      className: cn(
        cardVariants({ variant, padding, radius, clickable: isClickable }),
        className
      ),
      onClick,
      children: (
        <>
          {pressOverlay}
          {props.children}
        </>
      ),
    };

    if (asMotion) {
      return (
        <motion.div
          {...commonProps}
          whileTap={isClickable ? { scale: 0.98 } : undefined}
          {...props}
        />
      );
    }

    return <div {...commonProps} {...(props as React.HTMLAttributes<HTMLDivElement>)} />;
  }
);

Card.displayName = 'Card';
