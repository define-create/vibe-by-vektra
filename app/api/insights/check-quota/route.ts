import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { getQuotaStatus } from '@/lib/ai/quota-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/insights/check-quota
 *
 * Check current quota status for insights
 *
 * Query params:
 * - anonId: string (optional) - for guest users
 *
 * Response:
 * - daily: { used, limit }
 * - monthly: { used, limit }
 * - isGuest: boolean
 * - guestUsed: boolean
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anonId = searchParams.get('anonId');

    // Get user session
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || null;

    // Get quota status
    const status = await getQuotaStatus(userId, anonId);

    return NextResponse.json(status);
  } catch (error) {
    console.error('[API] Error checking quota:', error);

    return NextResponse.json(
      { error: 'Failed to check quota status' },
      { status: 500 }
    );
  }
}
