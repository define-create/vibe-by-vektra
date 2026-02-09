import { adminClient } from '@/lib/db/supabase';
import { QuotaCheckResult } from '@/types';

/**
 * Quota enforcement for AI insights
 *
 * Guest users: 1 insight total (per anon_id)
 * Authenticated users:
 *   - 3 insights per day (UTC-based)
 *   - 30 insights per month
 *   - 10-minute cooldown between runs
 *   - Max 2 regenerations per InsightRun
 */

const DAILY_LIMIT = 3;
const MONTHLY_LIMIT = 30;
const COOLDOWN_MINUTES = 10;
const MAX_REGENERATIONS = 2;

/**
 * Check if user/guest can generate an insight
 */
export async function checkQuota(
  userId: string | null,
  anonId: string | null
): Promise<QuotaCheckResult> {
  // Guest mode
  if (!userId && anonId) {
    return await checkGuestQuota(anonId);
  }

  // Authenticated mode
  if (userId) {
    return await checkAuthenticatedQuota(userId);
  }

  return {
    allowed: false,
    reason: 'no_auth',
    message: 'No authentication provided',
  };
}

/**
 * Check guest quota (1 insight total)
 */
async function checkGuestQuota(anonId: string): Promise<QuotaCheckResult> {
  const { data, error } = await adminClient
    .from('guest_insight_allowance')
    .select('consumed_at')
    .eq('anon_id', anonId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which means quota not consumed
    console.error('[Quota] Error checking guest allowance:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'Failed to check quota',
    };
  }

  if (data) {
    return {
      allowed: false,
      reason: 'guest_quota_exceeded',
      message: 'You\'ve used your one-time insight. Create an account for ongoing analysis.',
      quotaUsed: 1,
      quotaLimit: 1,
    };
  }

  return {
    allowed: true,
    quotaUsed: 0,
    quotaLimit: 1,
    isGuest: true,
  };
}

/**
 * Check authenticated user quota
 */
async function checkAuthenticatedQuota(userId: string): Promise<QuotaCheckResult> {
  // Get today's runs (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: todayRuns, error: todayError } = await adminClient
    .from('insight_runs')
    .select('id, created_at')
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false });

  if (todayError) {
    console.error('[Quota] Error checking daily runs:', todayError);
    return {
      allowed: false,
      reason: 'error',
      message: 'Failed to check daily quota',
    };
  }

  // Check daily limit
  if (todayRuns && todayRuns.length >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'daily_limit',
      message: `Daily limit reached (${DAILY_LIMIT} insights per day)`,
      quotaUsed: todayRuns.length,
      quotaLimit: DAILY_LIMIT,
    };
  }

  // Get this month's runs
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data: monthRuns, error: monthError } = await adminClient
    .from('insight_runs')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString());

  if (monthError) {
    console.error('[Quota] Error checking monthly runs:', monthError);
    return {
      allowed: false,
      reason: 'error',
      message: 'Failed to check monthly quota',
    };
  }

  // Check monthly limit
  if (monthRuns && monthRuns.length >= MONTHLY_LIMIT) {
    return {
      allowed: false,
      reason: 'monthly_limit',
      message: `Monthly limit reached (${MONTHLY_LIMIT} insights per month)`,
      quotaUsed: monthRuns.length,
      quotaLimit: MONTHLY_LIMIT,
    };
  }

  // Check cooldown (10 minutes since last run)
  if (todayRuns && todayRuns.length > 0) {
    const lastRun = todayRuns[0];
    const lastRunTime = new Date(lastRun.created_at);
    const minutesSince = (Date.now() - lastRunTime.getTime()) / 1000 / 60;

    if (minutesSince < COOLDOWN_MINUTES) {
      const minutesRemaining = Math.ceil(COOLDOWN_MINUTES - minutesSince);
      return {
        allowed: false,
        reason: 'cooldown',
        message: `Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before generating another insight`,
        minutesRemaining,
      };
    }
  }

  // All checks passed
  return {
    allowed: true,
    quotaUsed: todayRuns?.length || 0,
    quotaLimit: DAILY_LIMIT,
    monthlyUsed: monthRuns?.length || 0,
    monthlyLimit: MONTHLY_LIMIT,
  };
}

/**
 * Record guest insight consumption
 */
export async function consumeGuestQuota(anonId: string): Promise<void> {
  const { error } = await adminClient
    .from('guest_insight_allowance')
    .insert({
      anon_id: anonId,
      consumed_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Quota] Error consuming guest quota:', error);
    throw new Error('Failed to record guest insight usage');
  }
}

/**
 * Check if regeneration is allowed for a specific run
 */
export async function checkRegenerationQuota(runId: string): Promise<QuotaCheckResult> {
  const { data: run, error } = await adminClient
    .from('insight_runs')
    .select('regeneration_count')
    .eq('id', runId)
    .single();

  if (error || !run) {
    return {
      allowed: false,
      reason: 'error',
      message: 'Run not found',
    };
  }

  if (run.regeneration_count >= MAX_REGENERATIONS) {
    return {
      allowed: false,
      reason: 'regeneration_limit',
      message: `Maximum ${MAX_REGENERATIONS} regenerations per insight reached`,
      quotaUsed: run.regeneration_count,
      quotaLimit: MAX_REGENERATIONS,
    };
  }

  return {
    allowed: true,
    quotaUsed: run.regeneration_count,
    quotaLimit: MAX_REGENERATIONS,
  };
}

/**
 * Increment regeneration count for a run
 */
export async function incrementRegenerationCount(runId: string): Promise<void> {
  const { error } = await adminClient
    .from('insight_runs')
    .update({ regeneration_count: adminClient.rpc('regeneration_count') })
    .eq('id', runId);

  if (error) {
    console.error('[Quota] Error incrementing regeneration count:', error);
  }
}

/**
 * Get quota status summary for UI display
 */
export async function getQuotaStatus(
  userId: string | null,
  anonId: string | null
): Promise<{
  daily: { used: number; limit: number };
  monthly: { used: number; limit: number };
  isGuest: boolean;
  guestUsed: boolean;
}> {
  if (!userId && anonId) {
    const { data } = await adminClient
      .from('guest_insight_allowance')
      .select('consumed_at')
      .eq('anon_id', anonId)
      .single();

    return {
      daily: { used: data ? 1 : 0, limit: 1 },
      monthly: { used: data ? 1 : 0, limit: 1 },
      isGuest: true,
      guestUsed: !!data,
    };
  }

  if (userId) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const { data: todayRuns } = await adminClient
      .from('insight_runs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());

    const { data: monthRuns } = await adminClient
      .from('insight_runs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString());

    return {
      daily: { used: todayRuns?.length || 0, limit: DAILY_LIMIT },
      monthly: { used: monthRuns?.length || 0, limit: MONTHLY_LIMIT },
      isGuest: false,
      guestUsed: false,
    };
  }

  return {
    daily: { used: 0, limit: 0 },
    monthly: { used: 0, limit: 0 },
    isGuest: false,
    guestUsed: false,
  };
}
