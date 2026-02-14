/**
 * Grid2Col - 2-column responsive grid for secondary journey cards
 * Mobile-first design
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Grid2ColProps {
  children: ReactNode;
  className?: string;
}

export function Grid2Col({ children, className = '' }: Grid2ColProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 gap-md',
        className
      )}
    >
      {children}
    </div>
  );
}
