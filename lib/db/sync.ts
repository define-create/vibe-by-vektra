import { localDB, localDBHelpers } from './local-db';
import { dbHelpers } from './supabase';

/**
 * Guest → Account Migration
 * Syncs all local guest data to Supabase when user creates an account
 */

export interface MigrationResult {
  success: boolean;
  sessionLogsSynced: number;
  peopleSynced: number;
  supportingInputsSynced: number;
  errors: string[];
}

export const syncManager = {
  /**
   * Migrate all guest data to authenticated user account
   * Called after user completes magic link authentication
   */
  async migrateGuestDataToAccount(userId: string): Promise<MigrationResult> {
    const errors: string[] = [];
    let sessionLogsSynced = 0;
    let peopleSynced = 0;
    let supportingInputsSynced = 0;

    try {
      // 1. Migrate People first (needed for session logs)
      const unsyncedPeople = await localDBHelpers.getUnsyncedPeople();

      for (const person of unsyncedPeople) {
        try {
          const { error } = await dbHelpers.createPerson({
            id: person.id,
            user_id: userId,
            name: person.name,
            role_preference: person.rolePreference,
            rating: person.rating,
            created_at: person.createdAt,
          });

          if (error) throw error;

          // Mark as synced locally
          await localDB.people.update(person.id, { synced: true });
          peopleSynced++;
        } catch (error) {
          errors.push(`Failed to sync person ${person.name}: ${error}`);
        }
      }

      // 2. Migrate Supporting Inputs
      const unsyncedInputs = await localDBHelpers.getUnsyncedSupportingInputs();

      for (const input of unsyncedInputs) {
        try {
          const { error } = await dbHelpers.createSupportingInput({
            id: input.id,
            user_id: userId,
            name: input.name,
            description: input.description,
            is_enabled: input.isEnabled,
            seeded_preloaded: input.seededPreloaded,
            created_at: input.createdAt,
          });

          if (error) throw error;

          await localDB.supportingInputs.update(input.id, { synced: true });
          supportingInputsSynced++;
        } catch (error) {
          errors.push(`Failed to sync input ${input.name}: ${error}`);
        }
      }

      // 3. Migrate Session Logs
      const unsyncedSessions = await localDBHelpers.getUnsyncedSessionLogs();

      for (const session of unsyncedSessions) {
        try {
          // Create session log
          const { error: sessionError } = await dbHelpers.createSessionLog({
            id: session.id,
            user_id: userId,
            created_at: session.createdAt,
            played_at: session.playedAt,
            energy_before: session.energyBefore,
            energy_after: session.energyAfter,
            mood_before: session.moodBefore,
            mood_after: session.moodAfter,
            soreness_knees: session.sorenessKnees,
            soreness_shoulder: session.sorenessShoulder,
            soreness_back: session.sorenessBack,
            intensity: session.intensity,
            format: session.format,
            environment: session.environment,
            duration_minutes: session.durationMinutes,
            mental_tags: session.mentalTags,
            free_text_reflection: session.freeTextReflection,
            people_ids_played_with: session.peopleIdsPlayedWith,
            people_ids_played_against: session.peopleIdsPlayedAgainst,
          });

          if (sessionError) throw sessionError;

          // Add supporting inputs for this session
          if (session.supportingInputIds.length > 0) {
            await dbHelpers.addSessionInputs(session.id, session.supportingInputIds);
          }

          await localDB.sessionLogs.update(session.id, { synced: true });
          sessionLogsSynced++;
        } catch (error) {
          errors.push(`Failed to sync session ${session.id}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        sessionLogsSynced,
        peopleSynced,
        supportingInputsSynced,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        sessionLogsSynced,
        peopleSynced,
        supportingInputsSynced,
        errors: [...errors, `Migration failed: ${error}`],
      };
    }
  },

  /**
   * Download user data from Supabase to local IndexedDB
   * Called on login or when coming back online
   */
  async downloadUserDataToLocal(userId: string): Promise<void> {
    try {
      // Download session logs
      const { data: sessions, error: sessionsError } = await dbHelpers.getSessionLogs(userId);
      if (sessionsError) throw sessionsError;

      if (sessions) {
        for (const session of sessions) {
          await localDB.sessionLogs.put({
            id: session.id,
            createdAt: session.created_at,
            playedAt: session.played_at,
            energyBefore: session.energy_before,
            energyAfter: session.energy_after,
            moodBefore: session.mood_before,
            moodAfter: session.mood_after,
            sorenessHands: session.soreness_hands,
            sorenessKnees: session.soreness_knees,
            sorenessShoulder: session.soreness_shoulder,
            sorenessBack: session.soreness_back,
            intensity: session.intensity,
            format: session.format,
            environment: session.environment,
            durationMinutes: session.duration_minutes,
            mentalTags: session.mental_tags || [],
            freeTextReflection: session.free_text_reflection,
            peopleIdsPlayedWith: session.people_ids_played_with || [],
            peopleIdsPlayedAgainst: session.people_ids_played_against || [],
            supportingInputIds: [], // TODO: fetch from junction table
            synced: true,
          });
        }
      }

      // Download people
      const { data: people, error: peopleError } = await dbHelpers.getPeople(userId);
      if (peopleError) throw peopleError;

      if (people) {
        for (const person of people) {
          await localDB.people.put({
            id: person.id,
            name: person.name,
            rolePreference: person.role_preference,
            rating: person.rating,
            createdAt: person.created_at,
            synced: true,
          });
        }
      }

      // Download supporting inputs
      const { data: inputs, error: inputsError } = await dbHelpers.getSupportingInputs(userId);
      if (inputsError) throw inputsError;

      if (inputs) {
        for (const input of inputs) {
          await localDB.supportingInputs.put({
            id: input.id,
            name: input.name,
            description: input.description,
            isEnabled: input.is_enabled,
            seededPreloaded: input.seeded_preloaded,
            createdAt: input.created_at,
            synced: true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to download user data:', error);
      throw error;
    }
  },

  /**
   * Check if user has unsynced local data
   */
  async hasUnsyncedData(): Promise<boolean> {
    const unsyncedSessions = await localDBHelpers.getUnsyncedSessionLogs();
    const unsyncedPeople = await localDBHelpers.getUnsyncedPeople();
    const unsyncedInputs = await localDBHelpers.getUnsyncedSupportingInputs();

    return (
      unsyncedSessions.length > 0 ||
      unsyncedPeople.length > 0 ||
      unsyncedInputs.length > 0
    );
  },
};
