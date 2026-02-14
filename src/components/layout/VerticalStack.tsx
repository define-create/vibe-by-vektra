/**
 * VerticalStack - Consistent vertical spacing container
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VerticalStackProps {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const spacingMap = {
  sm: 'space-y-sm',
  md: 'space-y-md',
  lg: 'space-y-lg',
  xl: 'space-y-xl',
};

export function VerticalStack({
  children,
  spacing = 'md',
  className = '',
}: VerticalStackProps) {
  return (
    <div className={cn(spacingMap[spacing], className)}>
      {children}
    </div>
  );
}
