'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { MoodEnergyInput } from './MoodEnergyInput';
import { SorenessInput } from './SorenessInput';
import { SessionContextInputs } from './SessionContextInputs';
import { MentalTagsInput } from './MentalTagsInput';
import { ReflectionTextarea } from './ReflectionTextarea';
import { sessionLogSchema, type SessionLogFormData } from '@/lib/utils/validation';
import { useAuth } from '@/lib/hooks/useAuth';
import { localDB } from '@/lib/db/local-db';
import { dbHelpers } from '@/lib/db/supabase';
import { guestSessionTracker } from '@/lib/hooks/useAuth';
import type { MentalTag } from '@/types';

export function QuickLogForm() {
  const { mode, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionLogFormData>({
    resolver: zodResolver(sessionLogSchema),
    defaultValues: {
      playedAt: new Date(),
      energyBefore: 0,
      energyAfter: 0,
      moodBefore: 0,
      moodAfter: 0,
      sorenessKnees: 0,
      sorenessShoulder: 0,
      sorenessBack: 0,
      intensity: 'casual',
      format: 'singles',
      environment: 'indoor',
      durationMinutes: undefined,
      mentalTags: [],
      freeTextReflection: '',
      peopleIdsPlayedWith: [],
      peopleIdsPlayedAgainst: [],
      supportingInputIds: [],
    },
  });

  const formValues = watch();

  const onSubmit = async (data: SessionLogFormData) => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const sessionId = uuidv4();
      const now = new Date().toISOString();

      if (mode === 'guest') {
        // Save to IndexedDB for guest
        await localDB.sessionLogs.add({
          id: sessionId,
          createdAt: now,
          playedAt: data.playedAt.toISOString(),
          energyBefore: data.energyBefore,
          energyAfter: data.energyAfter,
          moodBefore: data.moodBefore,
          moodAfter: data.moodAfter,
          sorenessKnees: data.sorenessKnees as 0 | 1 | 2 | 3,
          sorenessShoulder: data.sorenessShoulder as 0 | 1 | 2 | 3,
          sorenessBack: data.sorenessBack as 0 | 1 | 2 | 3,
          intensity: data.intensity,
          format: data.format,
          environment: data.environment,
          durationMinutes: data.durationMinutes,
          mentalTags: data.mentalTags,
          freeTextReflection: data.freeTextReflection,
          peopleIdsPlayedWith: data.peopleIdsPlayedWith,
          peopleIdsPlayedAgainst: data.peopleIdsPlayedAgainst,
          supportingInputIds: data.supportingInputIds,
          synced: false,
        });

        // Increment guest session count
        guestSessionTracker.increment();
      } else if (user) {
        // Save to Supabase for authenticated users
        await dbHelpers.createSessionLog({
          id: sessionId,
          user_id: user.id,
          created_at: now,
          played_at: data.playedAt.toISOString(),
          energy_before: data.energyBefore,
          energy_after: data.energyAfter,
          mood_before: data.moodBefore,
          mood_after: data.moodAfter,
          soreness_knees: data.sorenessKnees,
          soreness_shoulder: data.sorenessShoulder,
          soreness_back: data.sorenessBack,
          intensity: data.intensity,
          format: data.format,
          environment: data.environment,
          duration_minutes: data.durationMinutes,
          mental_tags: data.mentalTags,
          free_text_reflection: data.freeTextReflection,
          people_ids_played_with: data.peopleIdsPlayedWith,
          people_ids_played_against: data.peopleIdsPlayedAgainst,
        });

        // Also save to local for offline access
        await localDB.sessionLogs.add({
          id: sessionId,
          createdAt: now,
          playedAt: data.playedAt.toISOString(),
          energyBefore: data.energyBefore,
          energyAfter: data.energyAfter,
          moodBefore: data.moodBefore,
          moodAfter: data.moodAfter,
          sorenessKnees: data.sorenessKnees as 0 | 1 | 2 | 3,
          sorenessShoulder: data.sorenessShoulder as 0 | 1 | 2 | 3,
          sorenessBack: data.sorenessBack as 0 | 1 | 2 | 3,
          intensity: data.intensity,
          format: data.format,
          environment: data.environment,
          durationMinutes: data.durationMinutes,
          mentalTags: data.mentalTags,
          freeTextReflection: data.freeTextReflection,
          peopleIdsPlayedWith: data.peopleIdsPlayedWith,
          peopleIdsPlayedAgainst: data.peopleIdsPlayedAgainst,
          supportingInputIds: data.supportingInputIds,
          synced: true,
        });
      }

      setSaveSuccess(true);

      // Reset form immediately with current date and cleared fields
      setTimeout(() => {
        reset({
          playedAt: new Date(),
          energyBefore: 0,
          energyAfter: 0,
          moodBefore: 0,
          moodAfter: 0,
          sorenessKnees: 0,
          sorenessShoulder: 0,
          sorenessBack: 0,
          intensity: 'casual',
          format: 'singles',
          environment: 'indoor',
          durationMinutes: undefined,
          mentalTags: [],
          freeTextReflection: '',
          peopleIdsPlayedWith: [],
          peopleIdsPlayedAgainst: [],
          supportingInputIds: [],
        });
        setSaveSuccess(false);
      }, 800);
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-32">
      {/* Session Date */}
      <div className="space-y-2">
        <label htmlFor="playedAt" className="text-sm font-medium text-foreground">
          Session Date
        </label>
        <input
          id="playedAt"
          type="datetime-local"
          value={formValues.playedAt.toISOString().slice(0, 16)}
          onChange={(e) => setValue('playedAt', new Date(e.target.value))}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Mood & Energy */}
      <MoodEnergyInput
        label="Energy"
        beforeValue={formValues.energyBefore}
        afterValue={formValues.energyAfter}
        onBeforeChange={(v) => setValue('energyBefore', v)}
        onAfterChange={(v) => setValue('energyAfter', v)}
      />

      <MoodEnergyInput
        label="Mood"
        beforeValue={formValues.moodBefore}
        afterValue={formValues.moodAfter}
        onBeforeChange={(v) => setValue('moodBefore', v)}
        onAfterChange={(v) => setValue('moodAfter', v)}
      />

      {/* Soreness */}
      <SorenessInput
        knees={formValues.sorenessKnees as 0 | 1 | 2 | 3}
        shoulder={formValues.sorenessShoulder as 0 | 1 | 2 | 3}
        back={formValues.sorenessBack as 0 | 1 | 2 | 3}
        onKneesChange={(v) => setValue('sorenessKnees', v)}
        onShoulderChange={(v) => setValue('sorenessShoulder', v)}
        onBackChange={(v) => setValue('sorenessBack', v)}
      />

      {/* Session Context */}
      <SessionContextInputs
        intensity={formValues.intensity}
        format={formValues.format}
        environment={formValues.environment}
        durationMinutes={formValues.durationMinutes}
        onIntensityChange={(v) => setValue('intensity', v)}
        onFormatChange={(v) => setValue('format', v)}
        onEnvironmentChange={(v) => setValue('environment', v)}
        onDurationChange={(v) => setValue('durationMinutes', v)}
      />

      {/* Mental Tags */}
      <MentalTagsInput
        selectedTags={formValues.mentalTags as MentalTag[]}
        onTagsChange={(tags) => setValue('mentalTags', tags)}
      />

      {/* Reflection */}
      <ReflectionTextarea
        value={formValues.freeTextReflection || ''}
        onChange={(v) => setValue('freeTextReflection', v)}
      />

      {/* Submit Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full h-12 text-base"
        >
          {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Session'}
        </Button>
      </div>
    </form>
  );
}
