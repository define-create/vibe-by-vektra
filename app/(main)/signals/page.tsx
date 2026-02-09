'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { SupportingInput } from '@/types';
import { Button } from '@/components/ui/button';
import { SignalCard } from '@/components/signals/SignalCard';
import { SignalForm } from '@/components/signals/SignalForm';
import { DeleteConfirmDialog } from '@/components/people/DeleteConfirmDialog';
import { Plus, Info } from 'lucide-react';
import { dbHelpers } from '@/lib/db/supabase';
import { localDB } from '@/lib/db/local-db';
import { v4 as uuidv4 } from 'uuid';
import { SEEDED_SUPPORTING_INPUTS } from '@/lib/constants/seeded-signals';

export default function SignalsPage() {
  const { mode, user } = useAuth();
  const [signals, setSignals] = useState<SupportingInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<SupportingInput | undefined>();
  const [deletingSignal, setDeletingSignal] = useState<SupportingInput | null>(null);
  const [hasSeededInputs, setHasSeededInputs] = useState(false);

  useEffect(() => {
    fetchSignals();
  }, [user, mode]);

  async function fetchSignals() {
    setIsLoading(true);
    try {
      if (mode === 'authenticated' && user) {
        // Fetch from Supabase
        const { data, error } = await dbHelpers.getSupportingInputs(user.id);
        if (!error && data) {
          const inputs = data as SupportingInput[];
          setSignals(inputs);
          setHasSeededInputs(inputs.some(s => s.seededPreloaded));

          // Seed defaults if none exist
          if (inputs.length === 0) {
            await seedDefaultInputs();
          }
        }
      } else {
        // Fetch from IndexedDB (guest mode)
        const localSignals = await localDB.supportingInputs.toArray();
        const inputs = localSignals.map(s => ({
          id: s.id,
          userId: '',
          name: s.name,
          description: s.description,
          isEnabled: s.isEnabled,
          seededPreloaded: s.seededPreloaded,
          createdAt: s.createdAt,
        }));
        setSignals(inputs);
        setHasSeededInputs(inputs.some(s => s.seededPreloaded));

        // Seed defaults if none exist
        if (inputs.length === 0) {
          await seedDefaultInputs();
        }
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function seedDefaultInputs() {
    const seededSignals = SEEDED_SUPPORTING_INPUTS.map(input => ({
      name: input.name,
      description: input.description,
      is_enabled: input.isEnabled,
      seeded_preloaded: true,
    }));

    if (mode === 'authenticated' && user) {
      // Insert to Supabase
      for (const signal of seededSignals) {
        await dbHelpers.createSupportingInput({
          user_id: user.id,
          ...signal,
        });
      }
    } else {
      // Insert to IndexedDB
      for (const signal of SEEDED_SUPPORTING_INPUTS) {
        await localDB.supportingInputs.add({
          id: uuidv4(),
          name: signal.name,
          description: signal.description,
          isEnabled: signal.isEnabled,
          seededPreloaded: true,
          createdAt: new Date().toISOString(),
          synced: false,
        });
      }
    }

    await fetchSignals();
  }

  async function handleSave(data: { name: string; description?: string }) {
    if (editingSignal) {
      // Update existing signal
      if (mode === 'authenticated' && user) {
        await dbHelpers.updateSupportingInput(editingSignal.id, data);
      } else {
        await localDB.supportingInputs.update(editingSignal.id, {
          name: data.name,
          description: data.description,
        });
      }
    } else {
      // Create new signal
      if (mode === 'authenticated' && user) {
        await dbHelpers.createSupportingInput({
          user_id: user.id,
          ...data,
          is_enabled: true,
          seeded_preloaded: false,
        });
      } else {
        await localDB.supportingInputs.add({
          id: uuidv4(),
          name: data.name,
          description: data.description,
          isEnabled: true,
          seededPreloaded: false,
          createdAt: new Date().toISOString(),
          synced: false,
        });
      }
    }

    await fetchSignals();
    setEditingSignal(undefined);
  }

  async function handleToggle(signal: SupportingInput, enabled: boolean) {
    if (mode === 'authenticated') {
      await dbHelpers.updateSupportingInput(signal.id, { is_enabled: enabled });
    } else {
      await localDB.supportingInputs.update(signal.id, { isEnabled: enabled });
    }

    await fetchSignals();
  }

  async function handleDelete(signal: SupportingInput) {
    // Prevent deletion of seeded signals
    if (signal.seededPreloaded) {
      return;
    }

    if (mode === 'authenticated') {
      await dbHelpers.updateSupportingInput(signal.id, { is_enabled: false });
    } else {
      await localDB.supportingInputs.delete(signal.id);
    }

    await fetchSignals();
    setDeletingSignal(null);
  }

  // Separate enabled and disabled signals
  const enabledSignals = signals.filter(s => s.isEnabled);
  const disabledSignals = signals.filter(s => !s.isEnabled);

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto pb-24">
      <div className="pt-8 pb-6 space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Supporting Inputs
        </h1>
        <p className="text-sm text-muted-foreground">
          Track factors that might affect your sessions
        </p>
      </div>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>
              Supporting inputs help you track contextual factors like sleep, hydration,
              and stress. Enable the ones you want to track, and disable those you
              don&apos;t need.
            </p>
          </div>
        </div>

        {/* Add Button */}
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Input
        </Button>

        {/* Signals List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Enabled Signals */}
            {enabledSignals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Active ({enabledSignals.length})
                </h2>
                {enabledSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onEdit={() => {
                      setEditingSignal(signal);
                      setFormOpen(true);
                    }}
                    onDelete={() => setDeletingSignal(signal)}
                    onToggle={(enabled) => handleToggle(signal, enabled)}
                  />
                ))}
              </div>
            )}

            {/* Disabled Signals */}
            {disabledSignals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Disabled ({disabledSignals.length})
                </h2>
                {disabledSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onEdit={() => {
                      setEditingSignal(signal);
                      setFormOpen(true);
                    }}
                    onDelete={() => setDeletingSignal(signal)}
                    onToggle={(enabled) => handleToggle(signal, enabled)}
                  />
                ))}
              </div>
            )}

            {signals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No supporting inputs yet</p>
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Input
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      <SignalForm
        signal={editingSignal}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSignal(undefined);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      {deletingSignal && !deletingSignal.seededPreloaded && (
        <DeleteConfirmDialog
          open={!!deletingSignal}
          personName={deletingSignal.name}
          onConfirm={() => handleDelete(deletingSignal)}
          onCancel={() => setDeletingSignal(null)}
        />
      )}
    </main>
  );
}
