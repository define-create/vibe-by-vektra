'use client';

import { useSessionLogs } from '@/lib/hooks/useSessionLogs';
import { SessionCard } from '@/components/history/SessionCard';
import { SessionsSummary } from '@/components/history/SessionsSummary';

export default function HistoryPage() {
  const { sessions, isLoading, error } = useSessionLogs();

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="pt-8">
          <div className="text-muted-foreground">Loading sessions...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="pt-8">
          <div className="text-destructive">Failed to load sessions</div>
        </div>
      </main>
    );
  }

  const hasNoSessions = sessions.length === 0;

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto pb-24">
      <div className="pt-8 pb-6 space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          History
        </h1>
        <p className="text-sm text-muted-foreground">
          Your session timeline and patterns
        </p>
      </div>

      {hasNoSessions ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No sessions logged yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Log your first session to start tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary & Calendar */}
          <SessionsSummary sessions={sessions} />

          {/* Sessions List */}
          <div>
            <h2 className="text-lg font-light mb-3">Recent Sessions</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
