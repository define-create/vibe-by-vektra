/**
 * ScreenContainer - Main layout container for all screens
 * Handles safe-area padding, header, and scroll area
 */

import { ReactNode } from 'react';

interface ScreenContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightActions?: ReactNode;
  className?: string;
}

export function ScreenContainer({
  children,
  title,
  subtitle,
  rightActions,
  className = '',
}: ScreenContainerProps) {
  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      <main className="max-w-4xl mx-auto px-md">
        {/* Header */}
        {(title || rightActions) && (
          <div className="pt-lg pb-md space-y-sm">
            <div className="flex items-start justify-between gap-md">
              {title && (
                <div className="flex-1 space-y-xs">
                  <h1 className="text-display text-text-primary">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-meta-sm text-text-secondary">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {rightActions && <div className="flex-shrink-0">{rightActions}</div>}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={className}>{children}</div>
      </main>
    </div>
  );
}
