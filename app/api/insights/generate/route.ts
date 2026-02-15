import { NextRequest, NextResponse } from 'next/server';
import { adminClient, createClient } from '@/lib/db/supabase';
import { SessionLog } from '@/types';
import { aggregateSessionsForInsight } from '@/lib/ai/aggregator';
import { generateInsights } from '@/lib/ai/insights-generator';
import { checkQuota, consumeGuestQuota } from '@/lib/ai/quota-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/insights/generate
 *
 * Generate AI insights from user's session data
 *
 * Request body:
 * - windowDays: number (default 14) - how many days of data to analyze
 * - anonId: string (optional) - for guest users
 *
 * Response:
 * - run: InsightRun
 * - artifacts: InsightArtifact[]
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { windowDays = 14, anonId = null, guestSessions = null } = body;

    // Get user session (may be null for guest)
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || null;

    console.log('[API] Generate insights request:', {
      userId: userId ? 'authenticated' : 'guest',
      anonId,
      windowDays,
    });

    // Check quota
    const quotaCheck = await checkQuota(userId, anonId);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.message,
          reason: quotaCheck.reason,
          quotaUsed: quotaCheck.quotaUsed,
          quotaLimit: quotaCheck.quotaLimit,
          minutesRemaining: quotaCheck.minutesRemaining,
        },
        { status: 429 }
      );
    }

    // Fetch sessions
    let sessions: SessionLog[] = [];

    if (userId) {
      // Authenticated user: fetch from Supabase
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - windowDays);

      const { data, error } = await supabase
        .from('session_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('played_at', windowStart.toISOString())
        .order('played_at', { ascending: true });

      if (error) {
        console.error('[API] Error fetching sessions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch session data' },
          { status: 500 }
        );
      }

      sessions = (data || []).map(mapSupabaseSession);
    } else if (guestSessions) {
      // Guest user: sessions sent from client
      // Filter sessions within the window
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - windowDays);

      sessions = guestSessions.filter((session: SessionLog) => {
        const sessionDate = new Date(session.playedAt);
        return sessionDate >= windowStart;
      });
    } else {
      // Guest user without session data
      return NextResponse.json(
        {
          error: 'Guest mode requires session data to be provided',
        },
        { status: 400 }
      );
    }

    // Validate minimum sessions
    if (sessions.length < 3) {
      return NextResponse.json(
        {
          error: 'Need at least 3 sessions to generate insights',
          sessionsCount: sessions.length,
        },
        { status: 400 }
      );
    }

    // Aggregate data
    const aggregatedData = await aggregateSessionsForInsight(sessions, windowDays);

    // Generate insights using Claude
    const insights = await generateInsights(aggregatedData);

    // Store results
    if (userId) {
      // Authenticated: store in Supabase
      const { data: run, error: runError } = await adminClient
        .from('insight_runs')
        .insert({
          user_id: userId,
          window_start: aggregatedData.windowStart,
          window_end: aggregatedData.windowEnd,
          sessions_count: aggregatedData.sessionsCount,
          prompt_version: 'v1',
          regeneration_count: 0,
        })
        .select()
        .single();

      if (runError || !run) {
        console.error('[API] Error creating insight run:', runError);
        return NextResponse.json(
          { error: 'Failed to store insight run' },
          { status: 500 }
        );
      }

      // Store artifacts
      const artifactsToInsert = insights.map((insight) => ({
        run_id: run.id,
        title: insight.title,
        observation_text: insight.observationText,
        confidence: insight.confidence,
        evidence_summary: insight.evidenceSummary,
        metrics: insight.metrics,
      }));

      const { data: artifacts, error: artifactsError } = await adminClient
        .from('insight_artifacts')
        .insert(artifactsToInsert)
        .select();

      if (artifactsError) {
        console.error('[API] Error creating artifacts:', artifactsError);
        return NextResponse.json(
          { error: 'Failed to store insights' },
          { status: 500 }
        );
      }

      console.log(`[API] Successfully generated ${artifacts?.length} insights for user ${userId}`);

      return NextResponse.json({
        run,
        artifacts,
        quotaUsed: quotaCheck.quotaUsed! + 1,
        quotaLimit: quotaCheck.quotaLimit!,
        monthlyUsed: quotaCheck.monthlyUsed,
        monthlyLimit: quotaCheck.monthlyLimit,
      });
    } else if (anonId) {
      // Guest: consume quota and return insights (not stored in cloud)
      await consumeGuestQuota(anonId);

      // Add unique IDs to guest insights for React keys
      const insightsWithIds = insights.map((insight) => ({
        ...insight,
        id: crypto.randomUUID(),
        runId: 'guest',
        createdAt: new Date().toISOString(),
      }));

      console.log(`[API] Successfully generated ${insights.length} insights for guest ${anonId}`);

      return NextResponse.json({
        insights: insightsWithIds,
        isGuest: true,
        quotaUsed: 1,
        quotaLimit: 1,
      });
    } else {
      return NextResponse.json(
        { error: 'No authentication provided' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[API] Error generating insights:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate insights';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Map Supabase session to SessionLog type
 */
function mapSupabaseSession(data: any): SessionLog {
  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    playedAt: data.played_at,
    energyBefore: data.energy_before,
    energyAfter: data.energy_after,
    moodBefore: data.mood_before,
    moodAfter: data.mood_after,
    sorenessHands: data.soreness_hands,
    sorenessKnees: data.soreness_knees,
    sorenessShoulder: data.soreness_shoulder,
    sorenessBack: data.soreness_back,
    intensity: data.intensity,
    format: data.format,
    environment: data.environment,
    durationMinutes: data.duration_minutes,
    mentalTags: data.mental_tags || [],
    freeTextReflection: data.free_text_reflection,
    peopleIdsPlayedWith: data.people_ids_played_with || [],
    peopleIdsPlayedAgainst: data.people_ids_played_against || [],
  };
}
