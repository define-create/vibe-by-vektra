'use client';

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { LocalSessionLog } from '@/lib/db/local-db';

interface SessionsSummaryProps {
  sessions: LocalSessionLog[];
  selectedMonth?: Date;
}

export function SessionsSummary({ sessions, selectedMonth = new Date() }: SessionsSummaryProps) {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group sessions by date
  const sessionsByDate = new Map<string, LocalSessionLog[]>();
  sessions.forEach(session => {
    const dateKey = format(new Date(session.playedAt), 'yyyy-MM-dd');
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  // Calculate stats
  const totalSessions = sessions.length;
  const daysWithSessions = sessionsByDate.size;
  const avgEnergyDelta =
    totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.energyAfter - s.energyBefore), 0) / totalSessions
      : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-2xl font-light">{totalSessions}</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-2xl font-light">{daysWithSessions}</div>
          <div className="text-xs text-muted-foreground">Days Active</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className={cn(
            'text-2xl font-light',
            avgEnergyDelta > 0 ? 'text-green-500' :
            avgEnergyDelta < 0 ? 'text-red-500' :
            ''
          )}>
            {avgEnergyDelta > 0 && '+'}{avgEnergyDelta.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Avg Energy Δ</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        <div className="text-sm font-medium mb-2">
          {format(selectedMonth, 'MMMM yyyy')}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}

          {/* Days */}
          {daysInMonth.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const sessionsOnDay = sessionsByDate.get(dateKey) || [];
            const hasSession = sessionsOnDay.length > 0;

            return (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded flex items-center justify-center text-xs relative',
                  hasSession
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
                {hasSession && sessionsOnDay.length > 1 && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
