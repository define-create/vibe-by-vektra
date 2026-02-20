'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Person, RolePreference } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PersonCard } from '@/components/people/PersonCard';
import { PersonForm } from '@/components/people/PersonForm';
import { DeleteConfirmDialog } from '@/components/people/DeleteConfirmDialog';
import { Plus, Search } from 'lucide-react';
import { dbHelpers } from '@/lib/db/supabase';
import { localDB } from '@/lib/db/local-db';
import { v4 as uuidv4 } from 'uuid';

export default function PeoplePage() {
  const { mode, user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

  useEffect(() => {
    fetchPeople();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mode]);

  async function fetchPeople() {
    setIsLoading(true);
    try {
      if (mode === 'authenticated' && user) {
        // Fetch from Supabase
        const { data, error } = await dbHelpers.getPeople(user.id);
        if (!error && data) {
          setPeople(data as Person[]);
        }
      } else {
        // Fetch from IndexedDB (guest mode)
        const localPeople = await localDB.people.toArray();
        setPeople(localPeople.map(p => ({
          id: p.id,
          userId: '',
          name: p.name,
          rolePreference: p.rolePreference,
          rating: p.rating,
          createdAt: p.createdAt,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch people:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(data: {
    name: string;
    rolePreference?: RolePreference;
    rating?: number;
  }) {
    if (editingPerson) {
      // Update existing person
      if (mode === 'authenticated' && user) {
        await dbHelpers.updatePerson(editingPerson.id, data);
      } else {
        await localDB.people.update(editingPerson.id, {
          name: data.name,
          rolePreference: data.rolePreference,
          rating: data.rating,
        });
      }
    } else {
      // Create new person
      if (mode === 'authenticated' && user) {
        await dbHelpers.createPerson({
          user_id: user.id,
          ...data,
        });
      } else {
        await localDB.people.add({
          id: uuidv4(),
          name: data.name,
          rolePreference: data.rolePreference,
          rating: data.rating,
          createdAt: new Date().toISOString(),
          synced: false,
        });
      }
    }

    await fetchPeople();
    setEditingPerson(undefined);
  }

  async function handleDelete(person: Person) {
    if (mode === 'authenticated') {
      await dbHelpers.deletePerson(person.id);
    } else {
      await localDB.people.delete(person.id);
    }

    await fetchPeople();
    setDeletingPerson(null);
  }

  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto pb-24">
      <div className="pt-8 pb-6 space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          People
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your directory of players
        </p>
      </div>

      <div className="space-y-4">
        {/* Search and Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        </div>

        {/* People List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <p className="text-muted-foreground">No people found</p>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  No people in your directory yet
                </p>
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Person
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onEdit={() => {
                  setEditingPerson(person);
                  setFormOpen(true);
                }}
                onDelete={() => setDeletingPerson(person)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      <PersonForm
        person={editingPerson}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPerson(undefined);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      {deletingPerson && (
        <DeleteConfirmDialog
          open={!!deletingPerson}
          personName={deletingPerson.name}
          onConfirm={() => handleDelete(deletingPerson)}
          onCancel={() => setDeletingPerson(null)}
        />
      )}
    </main>
  );
}
