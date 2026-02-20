import { z } from 'zod';
import { MENTAL_TAGS, type MentalTag } from '@/types';

// Zod schema for session log form
export const sessionLogSchema = z.object({
  playedAt: z.date(),
  energyBefore: z.number().min(1, 'Please select energy level before session').max(5),
  energyAfter: z.number().min(1, 'Please select energy level after session').max(5),
  moodBefore: z.number().min(1, 'Please select mood before session').max(5),
  moodAfter: z.number().min(1, 'Please select mood after session').max(5),
  sorenessHands: z.number().min(0).max(3),
  sorenessKnees: z.number().min(0).max(3),
  sorenessShoulder: z.number().min(0).max(3),
  sorenessBack: z.number().min(0).max(3),
  intensity: z.enum(['casual', 'moderate', 'competitive']),
  format: z.enum(['singles', 'doubles']),
  environment: z.enum(['indoor', 'outdoor']),
  durationMinutes: z.number().optional(),
  mentalTags: z.array(z.enum([...MENTAL_TAGS] as [MentalTag, ...MentalTag[]])),
  freeTextReflection: z.string().max(500).optional(),
  peopleIdsPlayedWith: z.array(z.string()),
  peopleIdsPlayedAgainst: z.array(z.string()),
  supportingInputIds: z.array(z.string()),
});

export type SessionLogFormData = z.infer<typeof sessionLogSchema>;
