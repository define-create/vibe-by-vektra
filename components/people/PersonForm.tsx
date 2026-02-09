'use client';

import { useState } from 'react';
import { Person, RolePreference } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PersonFormProps {
  person?: Person;
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    rolePreference?: RolePreference;
    rating?: number;
  }) => Promise<void>;
}

export function PersonForm({ person, open, onClose, onSave }: PersonFormProps) {
  const [name, setName] = useState(person?.name || '');
  const [rolePreference, setRolePreference] = useState<RolePreference | undefined>(
    person?.rolePreference
  );
  const [rating, setRating] = useState<number | undefined>(person?.rating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        rolePreference,
        rating,
      });
      onClose();
      // Reset form
      setName('');
      setRolePreference(undefined);
      setRating(undefined);
    } catch (err) {
      setError('Failed to save person');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{person ? 'Edit Person' : 'Add Person'}</DialogTitle>
          <DialogDescription>
            {person
              ? 'Update the details for this person'
              : 'Add someone you play with or against'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role Preference</Label>
            <Select
              value={rolePreference}
              onValueChange={(value) => setRolePreference(value as RolePreference)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">Partner (play with)</SelectItem>
                <SelectItem value="opponent">Opponent (play against)</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Skill Rating (1-5)</Label>
            <Select
              value={rating?.toString()}
              onValueChange={(value) => setRating(value ? parseInt(value) : undefined)}
            >
              <SelectTrigger id="rating">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Beginner</SelectItem>
                <SelectItem value="2">2 - Learning</SelectItem>
                <SelectItem value="3">3 - Intermediate</SelectItem>
                <SelectItem value="4">4 - Advanced</SelectItem>
                <SelectItem value="5">5 - Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : person ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
