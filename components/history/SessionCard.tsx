'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LocalSessionLog } from '@/lib/db/local-db';
import { getMentalTagLabel } from '@/lib/constants/mental-tags';

interface SessionCardProps {
  session: LocalSessionLog;
}

const SORENESS_LABELS = ['None', 'Low', 'Moderate', 'High'];

export function SessionCard({ session }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const energyDelta = session.energyAfter - session.energyBefore;
  const moodDelta = session.moodAfter - session.moodBefore;

  const hasSoreness =
    session.sorenessKnees > 0 ||
    session.sorenessShoulder > 0 ||
    session.sorenessBack > 0;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Compact View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            {/* Date & Time */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {format(new Date(session.playedAt), 'MMM d, yyyy')}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(session.playedAt), 'h:mm a')}
              </span>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{session.format}</span>
              <span>•</span>
              <span className="capitalize">{session.intensity}</span>
              <span>•</span>
              <span className="capitalize">{session.environment}</span>
              {session.durationMinutes && (
                <>
                  <span>•</span>
                  <span>{session.durationMinutes}min</span>
                </>
              )}
            </div>

            {/* Energy & Mood Delta */}
            <div className="flex items-center gap-3 text-xs">
              <span className={cn(
                'font-medium',
                energyDelta > 0 ? 'text-green-500' :
                energyDelta < 0 ? 'text-red-500' :
                'text-muted-foreground'
              )}>
                Energy: {energyDelta > 0 && '+'}{energyDelta}
              </span>
              <span className={cn(
                'font-medium',
                moodDelta > 0 ? 'text-green-500' :
                moodDelta < 0 ? 'text-red-500' :
                'text-muted-foreground'
              )}>
                Mood: {moodDelta > 0 && '+'}{moodDelta}
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Energy & Mood Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Energy:</span>
              <span className="ml-2">{session.energyBefore} → {session.energyAfter}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mood:</span>
              <span className="ml-2">{session.moodBefore} → {session.moodAfter}</span>
            </div>
          </div>

          {/* Soreness */}
          {hasSoreness && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Soreness:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {session.sorenessKnees > 0 && (
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">
                    Knees: {SORENESS_LABELS[session.sorenessKnees]}
                  </span>
                )}
                {session.sorenessShoulder > 0 && (
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">
                    Shoulder: {SORENESS_LABELS[session.sorenessShoulder]}
                  </span>
                )}
                {session.sorenessBack > 0 && (
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">
                    Back: {SORENESS_LABELS[session.sorenessBack]}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mental Tags */}
          {session.mentalTags.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Mental State:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {session.mentalTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    {getMentalTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          {session.freeTextReflection && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Notes:</span>
              <p className="text-sm bg-secondary p-2 rounded">
                {session.freeTextReflection}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
