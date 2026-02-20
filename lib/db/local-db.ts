import Dexie, { Table } from 'dexie';
import type {
  IntensityLevel,
  SessionFormat,
  Environment,
  SorenessLevel,
  MentalTag,
  Confidence,
  RolePreference
} from '@/types';

// Local storage interfaces (IndexedDB schema)
export interface LocalSessionLog {
  id: string;
  createdAt: string;
  playedAt: string;
  energyBefore: number;
  energyAfter: number;
  moodBefore: number;
  moodAfter: number;
  sorenessHands: SorenessLevel;
  sorenessKnees: SorenessLevel;
  sorenessShoulder: SorenessLevel;
  sorenessBack: SorenessLevel;
  intensity: IntensityLevel;
  format: SessionFormat;
  environment: Environment;
  durationMinutes?: number;
  mentalTags: MentalTag[];
  freeTextReflection?: string;
  peopleIdsPlayedWith: string[];
  peopleIdsPlayedAgainst: string[];
  supportingInputIds: string[];
  synced?: boolean; // For guest→account migration tracking
  appliedRecommendations?: string[]; // IDs of recommendations followed
  pendingRecommendation?: {
    id: string;
    type: 'intensity' | 'consistency' | 'recovery';
    label: string;
    createdAt: string;
  };
}

export interface LocalPerson {
  id: string;
  name: string;
  rolePreference?: RolePreference;
  rating?: number;
  createdAt: string;
  synced?: boolean;
}

export interface LocalSupportingInput {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  seededPreloaded: boolean;
  createdAt: string;
  synced?: boolean;
}

export interface LocalInsightArtifact {
  id: string;
  createdAt: string;
  title: string;
  observationText: string;
  confidence: Confidence;
  evidenceSummary?: string;
  metrics?: Record<string, unknown>;
  windowStart: string;
  windowEnd: string;
  sessionsCount: number;
}

export interface LocalRecommendationOutcome {
  id: string;
  recommendationId: string;
  title: string;
  body: string;
  ctaLabel?: string;
  linkTo?: string;
  createdAt: string;
  dismissedAt?: string;
  dismissible: boolean;
}

// Dexie database class
class VibeLocalDB extends Dexie {
  sessionLogs!: Table<LocalSessionLog, string>;
  people!: Table<LocalPerson, string>;
  supportingInputs!: Table<LocalSupportingInput, string>;
  insights!: Table<LocalInsightArtifact, string>;
  recommendationOutcomes!: Table<LocalRecommendationOutcome, string>;

  constructor() {
    super('VibeLocalDB');

    // Version 1: Original schema
    this.version(1).stores({
      sessionLogs: 'id, playedAt, createdAt, synced',
      people: 'id, name, synced',
      supportingInputs: 'id, isEnabled, synced',
      insights: 'id, createdAt'
    });

    // Version 2: Add recommendation outcomes table
    this.version(2).stores({
      sessionLogs: 'id, playedAt, createdAt, synced',
      people: 'id, name, synced',
      supportingInputs: 'id, isEnabled, synced',
      insights: 'id, createdAt',
      recommendationOutcomes: 'id, recommendationId, createdAt, dismissedAt'
    });

    // Version 3: Add sorenessHands field to session logs
    this.version(3).stores({
      sessionLogs: 'id, playedAt, createdAt, synced',
      people: 'id, name, synced',
      supportingInputs: 'id, isEnabled, synced',
      insights: 'id, createdAt',
      recommendationOutcomes: 'id, recommendationId, createdAt, dismissedAt'
    }).upgrade(tx => {
      // Migration: set sorenessHands = 0 for existing records
      return tx.table('sessionLogs').toCollection().modify(log => {
        if (log.sorenessHands === undefined) {
          log.sorenessHands = 0;
        }
      });
    });
  }
}

// Export singleton instance
export const localDB = new VibeLocalDB();

// Helper functions for common operations
export const localDBHelpers = {
  // Session logs
  async addSessionLog(log: LocalSessionLog) {
    return await localDB.sessionLogs.add(log);
  },

  async getSessionLogs(limit?: number) {
    const query = localDB.sessionLogs.orderBy('playedAt').reverse();
    return limit ? await query.limit(limit).toArray() : await query.toArray();
  },

  async getSessionLogsInRange(startDate: Date, endDate: Date) {
    return await localDB.sessionLogs
      .where('playedAt')
      .between(startDate.toISOString(), endDate.toISOString(), true, true)
      .reverse()
      .toArray();
  },

  async getUnsyncedSessionLogs() {
    return await localDB.sessionLogs.where('synced').equals(0).toArray();
  },

  // People
  async addPerson(person: LocalPerson) {
    return await localDB.people.add(person);
  },

  async getPeople() {
    return await localDB.people.orderBy('name').toArray();
  },

  async getUnsyncedPeople() {
    return await localDB.people.where('synced').equals(0).toArray();
  },

  // Supporting inputs
  async addSupportingInput(input: LocalSupportingInput) {
    return await localDB.supportingInputs.add(input);
  },

  async getEnabledSupportingInputs() {
    return await localDB.supportingInputs.where('isEnabled').equals(1).toArray();
  },

  async getAllSupportingInputs() {
    return await localDB.supportingInputs.toArray();
  },

  async getUnsyncedSupportingInputs() {
    return await localDB.supportingInputs.where('synced').equals(0).toArray();
  },

  // Insights
  async addInsight(insight: LocalInsightArtifact) {
    return await localDB.insights.add(insight);
  },

  async getLatestInsight() {
    return await localDB.insights.orderBy('createdAt').reverse().first();
  },

  // Clear all data (for guest mode data deletion)
  async clearAllData() {
    await Promise.all([
      localDB.sessionLogs.clear(),
      localDB.people.clear(),
      localDB.supportingInputs.clear(),
      localDB.insights.clear()
    ]);
  },

  // Mark records as synced
  async markSessionLogsSynced(ids: string[]) {
    await localDB.sessionLogs.bulkUpdate(
      ids.map(id => ({ key: id, changes: { synced: true } }))
    );
  },

  async markPeopleSynced(ids: string[]) {
    await localDB.people.bulkUpdate(
      ids.map(id => ({ key: id, changes: { synced: true } }))
    );
  },

  async markSupportingInputsSynced(ids: string[]) {
    await localDB.supportingInputs.bulkUpdate(
      ids.map(id => ({ key: id, changes: { synced: true } }))
    );
  },

  // Recommendation outcomes
  async addRecommendationOutcome(outcome: LocalRecommendationOutcome) {
    return await localDB.recommendationOutcomes.add(outcome);
  },

  async getActiveRecommendationOutcomes() {
    // Get all outcomes and filter for non-dismissed ones
    const allOutcomes = await localDB.recommendationOutcomes
      .orderBy('createdAt')
      .reverse()
      .toArray();

    return allOutcomes.filter(
      outcome => !outcome.dismissedAt || outcome.dismissedAt === ''
    );
  },

  async dismissRecommendationOutcome(id: string) {
    await localDB.recommendationOutcomes.update(id, {
      dismissedAt: new Date().toISOString()
    });
  },

  async getRecommendationOutcome(id: string) {
    return await localDB.recommendationOutcomes.get(id);
  }
};
