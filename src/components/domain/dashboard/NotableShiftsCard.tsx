'use client';

import { Card } from '@/src/components/ui/Card';
import type { NotableShift } from '@/lib/analytics/dashboard-metrics';
import { cn } from '@/lib/utils';

interface NotableShiftsCardProps {
  shifts: NotableShift[];
  isEmpty: boolean;
  className?: string;
}

export function NotableShiftsCard({ shifts, isEmpty, className }: NotableShiftsCardProps) {
  return (
    <Card variant="elevated" padding="default" className={cn('space-y-sm', className)}>
      <h3 className="text-body-md font-semibold text-text-primary">
        Notable Shifts
      </h3>

      {isEmpty ? (
        <div className="py-lg">
          <p className="text-body-sm text-text-secondary text-center">
            More history needed to detect meaningful shifts
          </p>
          <p className="text-meta-sm text-text-disabled text-center mt-xs">
            Log 3+ recent sessions for comparisons
          </p>
        </div>
      ) : shifts.length === 0 ? (
        <div className="py-lg">
          <p className="text-body-sm text-text-secondary text-center">
            No material changes detected in the recent period
          </p>
        </div>
      ) : (
        <ul className="space-y-md">
          {shifts.map((shift) => (
            <li key={shift.id} className="flex items-start gap-sm">
              <span className="text-accent-primary mt-1">•</span>
              <p className="text-body-sm text-text-primary flex-1">
                <span className="font-medium">{shift.metric}</span>{' '}
                <span className="text-text-secondary">{shift.direction} by</span>{' '}
                <span className="font-semibold text-accent-primary">{shift.magnitude}</span>{' '}
                <span className="text-text-disabled">(vs prior period)</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
