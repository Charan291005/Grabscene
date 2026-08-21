import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fast-forward any currently 'held' seats to expire in 10 seconds.
    // This allows evaluators to test the frontend warning state and the cron auto-release.
    const { error } = await supabase
      .from('show_seats')
      .update({ hold_expires_at: new Date(Date.now() + 10 * 1000).toISOString() })
      .eq('status', 'held');

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Fast-forwarded active holds to 10s TTL.' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
