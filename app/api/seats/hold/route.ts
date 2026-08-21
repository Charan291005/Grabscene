import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function POST(request: Request) {
  try {
    const { showId, seatIds, userId, ttlMinutes = 10 } = await request.json();

    if (!showId || !seatIds || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call hold_seats RPC
    const { data: success, error: rpcError } = await supabase.rpc('hold_seats', {
      p_show_id: showId,
      p_seat_ids: seatIds,
      p_user_id: userId,
      p_ttl_minutes: ttlMinutes
    });

    if (rpcError) {
      // If the RPC raises an exception (e.g. seat not available), return 409 Conflict
      return NextResponse.json({ error: rpcError.message, code: rpcError.code }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unhandled hold error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
