import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Create a Supabase client for browser/server usage (with RLS)
 * Use this in client components and API routes for authenticated requests
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

// Default client for browser/client-side usage (with RLS)
export const supabase = createClient();

// Admin client for server-side usage (bypasses RLS)
export const getSupabaseAdmin = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Admin client instance (bypasses RLS)
 * Use this for server-side operations that need elevated privileges
 */
export const adminClient = (() => {
  if (!supabaseServiceRoleKey) {
    // Return a proxy that throws an error when accessed
    return new Proxy({} as ReturnType<typeof getSupabaseAdmin>, {
      get() {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
      }
    });
  }
  return getSupabaseAdmin();
})();

// Type-safe database helpers
export const dbHelpers = {
  // Session logs
  async getSessionLogs(userId: string, limit?: number) {
    let query = supabase
      .from('session_logs')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  },

  async getSessionLogsInRange(userId: string, startDate: string, endDate: string) {
    return await supabase
      .from('session_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('played_at', startDate)
      .lte('played_at', endDate)
      .order('played_at', { ascending: false });
  },

  async createSessionLog(data: Record<string, unknown>) {
    return await supabase
      .from('session_logs')
      .insert(data)
      .select()
      .single();
  },

  // People
  async getPeople(userId: string) {
    return await supabase
      .from('people')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  },

  async createPerson(data: Record<string, unknown>) {
    return await supabase
      .from('people')
      .insert(data)
      .select()
      .single();
  },

  async updatePerson(id: string, data: Record<string, unknown>) {
    return await supabase
      .from('people')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  async deletePerson(id: string) {
    return await supabase
      .from('people')
      .delete()
      .eq('id', id);
  },

  // Supporting inputs
  async getSupportingInputs(userId: string) {
    return await supabase
      .from('supporting_inputs_catalog')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  },

  async createSupportingInput(data: Record<string, unknown>) {
    return await supabase
      .from('supporting_inputs_catalog')
      .insert(data)
      .select()
      .single();
  },

  async updateSupportingInput(id: string, data: Record<string, unknown>) {
    return await supabase
      .from('supporting_inputs_catalog')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  // Supporting inputs per session
  async addSessionInputs(sessionId: string, inputIds: string[]) {
    const records = inputIds.map(inputId => ({
      session_id: sessionId,
      input_id: inputId,
      present: true
    }));

    return await supabase
      .from('supporting_inputs_per_session')
      .insert(records);
  },

  async getSessionInputs(sessionId: string) {
    return await supabase
      .from('supporting_inputs_per_session')
      .select('input_id')
      .eq('session_id', sessionId);
  },

  // Insights
  async getInsightRuns(userId: string, limit?: number) {
    let query = supabase
      .from('insight_runs')
      .select('*, insight_artifacts(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  },

  async createInsightRun(data: Record<string, unknown>) {
    return await supabase
      .from('insight_runs')
      .insert(data)
      .select()
      .single();
  },

  async createInsightArtifacts(artifacts: Record<string, unknown>[]) {
    return await supabase
      .from('insight_artifacts')
      .insert(artifacts)
      .select();
  },

  // Data deletion
  async deleteAllUserData(userId: string) {
    // Cascading deletes will handle related records via foreign keys
    const results = await Promise.allSettled([
      supabase.from('session_logs').delete().eq('user_id', userId),
      supabase.from('people').delete().eq('user_id', userId),
      supabase.from('supporting_inputs_catalog').delete().eq('user_id', userId),
      supabase.from('insight_runs').delete().eq('user_id', userId)
    ]);

    return results;
  }
};
