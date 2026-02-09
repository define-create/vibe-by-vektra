'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { localDB, localDBHelpers } from '@/lib/db/local-db';
import { dbHelpers } from '@/lib/db/supabase';
import type { LocalSessionLog } from '@/lib/db/local-db';

export function useSessionLogs(limit?: number) {
  const { mode, user } = useAuth();
  const [sessions, setSessions] = useState<LocalSessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setIsLoading(true);
        let data: LocalSessionLog[] = [];

        if (mode === 'guest') {
          // Fetch from IndexedDB for guests
          data = await localDBHelpers.getSessionLogs(limit);
        } else if (user) {
          // Fetch from Supabase for authenticated users (already cached in IndexedDB)
          data = await localDBHelpers.getSessionLogs(limit);

          // If empty, fetch from Supabase
          if (data.length === 0) {
            const { data: cloudSessions, error: fetchError } = await dbHelpers.getSessionLogs(user.id, limit);

            if (fetchError) throw fetchError;

            // Convert to LocalSessionLog format
            if (cloudSessions) {
              data = cloudSessions.map(s => ({
                id: s.id,
                createdAt: s.created_at,
                playedAt: s.played_at,
                energyBefore: s.energy_before,
                energyAfter: s.energy_after,
                moodBefore: s.mood_before,
                moodAfter: s.mood_after,
                sorenessKnees: s.soreness_knees as 0 | 1 | 2 | 3,
                sorenessShoulder: s.soreness_shoulder as 0 | 1 | 2 | 3,
                sorenessBack: s.soreness_back as 0 | 1 | 2 | 3,
                intensity: s.intensity,
                format: s.format,
                environment: s.environment,
                durationMinutes: s.duration_minutes,
                mentalTags: s.mental_tags || [],
                freeTextReflection: s.free_text_reflection,
                peopleIdsPlayedWith: s.people_ids_played_with || [],
                peopleIdsPlayedAgainst: s.people_ids_played_against || [],
                supportingInputIds: [],
                synced: true,
              }));
            }
          }
        }

        setSessions(data);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch sessions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, [mode, user, limit]);

  return { sessions, isLoading, error };
}

export function useSessionLogsInRange(startDate: Date, endDate: Date) {
  const { mode, user } = useAuth();
  const [sessions, setSessions] = useState<LocalSessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setIsLoading(true);
        let data: LocalSessionLog[] = [];

        if (mode === 'guest') {
          data = await localDB.sessionLogs
            .where('playedAt')
            .between(startDate.toISOString(), endDate.toISOString(), true, true)
            .reverse()
            .toArray();
        } else if (user) {
          data = await localDB.sessionLogs
            .where('playedAt')
            .between(startDate.toISOString(), endDate.toISOString(), true, true)
            .reverse()
            .toArray();
        }

        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch sessions in range:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, [mode, user, startDate, endDate]);

  return { sessions, isLoading };
}
