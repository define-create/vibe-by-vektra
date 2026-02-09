// Core type definitions for Vibe by Vektra

export type IntensityLevel = 'casual' | 'moderate' | 'competitive';
export type SessionFormat = 'singles' | 'doubles';
export type Environment = 'indoor' | 'outdoor';
export type SorenessLevel = 0 | 1 | 2 | 3; // none, low, moderate, high
export type Confidence = 'low' | 'medium' | 'high';
export type RolePreference = 'partner' | 'opponent' | 'both';

export const MENTAL_TAGS = [
  'focused',
  'distracted',
  'confident',
  'anxious',
  'frustrated',
  'flow-state',
  'fatigued'
] as const;

export type MentalTag = typeof MENTAL_TAGS[number];

// Matches Supabase schema
export interface SessionLog {
  id: string;
  userId?: string;
  createdAt: string;
  playedAt: string;
  energyBefore: number;
  energyAfter: number;
  moodBefore: number;
  moodAfter: number;
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
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  rolePreference?: RolePreference;
  rating?: number;
  createdAt: string;
}

export interface SupportingInput {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  seededPreloaded: boolean;
  createdAt: string;
}

export interface InsightRun {
  id: string;
  userId: string;
  createdAt: string;
  windowStart: string;
  windowEnd: string;
  sessionsCount: number;
  promptVersion: string;
  regenerationCount: number;
}

export interface InsightArtifact {
  id: string;
  runId: string;
  createdAt: string;
  title: string;
  observationText: string;
  confidence: Confidence;
  evidenceSummary?: string;
  metrics?: Record<string, any>;
}

// Form data type (matches form inputs before persistence)
export interface SessionLogFormData {
  playedAt: Date;
  energyBefore: number;
  energyAfter: number;
  moodBefore: number;
  moodAfter: number;
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
}

// Aggregated data for AI insights (no PII)
export interface AggregatedData {
  sessionsCount: number;
  windowStart: string;
  windowEnd: string;
  windowDays: number;
  avgEnergyBefore: number;
  avgEnergyAfter: number;
  energyDeltaAvg: number;
  energyDeltaMin: number;
  energyDeltaMax: number;
  avgMoodBefore: number;
  avgMoodAfter: number;
  moodDeltaAvg: number;
  moodDeltaMin: number;
  moodDeltaMax: number;
  intensityDistribution: Record<IntensityLevel, number>;
  formatDistribution: Record<SessionFormat, number>;
  environmentDistribution: Record<Environment, number>;
  sorenessFrequency: {
    knees: Record<string, number>;
    shoulder: Record<string, number>;
    back: Record<string, number>;
  };
  mentalTagsFrequency: Record<string, number>;
  supportingInputsCorrelations?: Array<{
    inputName: string;
    presentCount: number;
    avgEnergyDelta: number;
    avgMoodDelta: number;
  }>;
  formatComparisons: {
    singles: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
    doubles: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
  };
  environmentComparisons: {
    indoor: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
    outdoor: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
  };
  intensityComparisons: {
    casual: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
    moderate: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
    competitive: { avgEnergyDelta: number; avgMoodDelta: number; count: number };
  };
  avgDurationMinutes?: number;
}

// Quota check response
export interface QuotaCheckResult {
  allowed: boolean;
  reason?: 'guest_quota_exceeded' | 'daily_limit' | 'monthly_limit' | 'cooldown' | 'regeneration_limit' | 'no_auth' | 'error';
  message?: string;
  minutesRemaining?: number;
  quotaUsed?: number;
  quotaLimit?: number;
  monthlyUsed?: number;
  monthlyLimit?: number;
  isGuest?: boolean;
}
