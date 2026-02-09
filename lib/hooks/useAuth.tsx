'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/db/supabase';
import { anonIdManager } from '@/lib/utils/anon-id';

export type AuthMode = 'guest' | 'authenticated';

export interface AuthState {
  mode: AuthMode;
  user: User | null;
  anonId: string | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [anonId, setAnonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Get or create anonymous ID for guest mode
    anonIdManager.getOrCreate().then(id => {
      setAnonId(id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mode: AuthMode = user ? 'authenticated' : 'guest';

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const value: AuthState = {
    mode,
    user,
    anonId,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Guest session count tracker
const GUEST_SESSION_COUNT_KEY = 'vibe_guest_session_count';
const GUEST_PROMPT_DISMISSED_KEY = 'vibe_guest_prompt_dismissed';

export const guestSessionTracker = {
  getCount(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const count = localStorage.getItem(GUEST_SESSION_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  },

  increment(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const current = this.getCount();
      const newCount = current + 1;
      localStorage.setItem(GUEST_SESSION_COUNT_KEY, newCount.toString());
      return newCount;
    } catch {
      return 0;
    }
  },

  reset(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(GUEST_SESSION_COUNT_KEY);
    } catch {
      // Ignore errors
    }
  },

  shouldShowPrompt(): boolean {
    const count = this.getCount();
    const dismissed = this.isPromptDismissed();
    return count >= 3 && !dismissed;
  },

  dismissPrompt(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GUEST_PROMPT_DISMISSED_KEY, 'true');
    } catch {
      // Ignore errors
    }
  },

  isPromptDismissed(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(GUEST_PROMPT_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  },
};
