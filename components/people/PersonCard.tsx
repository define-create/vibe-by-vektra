'use client';

import { Person } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PersonCardProps {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
}

export function PersonCard({ person, onEdit, onDelete }: PersonCardProps) {
  const roleColors = {
    partner: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    opponent: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    both: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="rounded-full bg-muted p-2">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base truncate">{person.name}</h3>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {person.rolePreference && (
                <Badge
                  variant="outline"
                  className={roleColors[person.rolePreference]}
                >
                  {person.rolePreference === 'both'
                    ? 'Partner & Opponent'
                    : person.rolePreference}
                </Badge>
              )}

              {person.rating && (
                <span className="text-sm text-muted-foreground">
                  Rating: {person.rating}/5
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
