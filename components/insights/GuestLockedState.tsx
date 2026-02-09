'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function GuestLockedState() {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-muted p-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-lg font-medium mb-2">
        You&apos;ve used your one-time Insight
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        Create an account for ongoing pattern analysis and data sync across
        devices.
      </p>

      <Button asChild>
        <Link href="/login">Create Account</Link>
      </Button>
    </Card>
  );
}
