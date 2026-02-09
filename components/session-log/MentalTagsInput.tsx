'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MENTAL_TAGS_CONFIG } from '@/lib/constants/mental-tags';
import type { MentalTag } from '@/types';

interface MentalTagsInputProps {
  selectedTags: MentalTag[];
  onTagsChange: (tags: MentalTag[]) => void;
}

export function MentalTagsInput({
  selectedTags,
  onTagsChange,
}: MentalTagsInputProps) {
  const toggleTag = (tag: MentalTag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">
        Mental State <span className="text-muted-foreground text-sm font-normal">(optional)</span>
      </Label>

      <div className="flex flex-wrap gap-2">
        {MENTAL_TAGS_CONFIG.map((tag) => {
          const isSelected = selectedTags.includes(tag.value);
          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={cn(
                'px-3 py-2 rounded-lg border-2 transition-all text-sm',
                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary text-muted-foreground'
              )}
              title={tag.description}
              aria-label={tag.label}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedTags.length} selected
        </div>
      )}
    </div>
  );
}
