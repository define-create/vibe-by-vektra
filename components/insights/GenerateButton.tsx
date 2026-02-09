'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => Promise<void>;
  quotaUsed: number;
  quotaLimit: number;
  isDisabled: boolean;
  disabledReason?: string;
}

export function GenerateButton({
  onGenerate,
  quotaUsed,
  quotaLimit,
  isDisabled,
  disabledReason,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (isDisabled || isGenerating) return;

    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const quotaText = `${quotaUsed} of ${quotaLimit} today`;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClick}
        disabled={isDisabled || isGenerating}
        size="lg"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating insights...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Insights
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {isDisabled && disabledReason ? (
          <p className="text-amber-500">{disabledReason}</p>
        ) : (
          <p>{quotaText}</p>
        )}
      </div>
    </div>
  );
}
