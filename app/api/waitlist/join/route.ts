import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function POST(request: Request) {
  try {
    const { showId, sectionId, userId } = await request.json();

    if (!showId || !sectionId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // MOCK BYPASS
    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        waitlistId: 'mock-waitlist-id',
        queuePosition: Math.floor(Math.random() * 50) + 1,
      });
    }

    const { data, error } = await supabase.rpc('join_waitlist', {
      p_show_id: showId,
      p_section_id: sectionId,
      p_user_id: userId,
    });

    if (error) {
      // User already on waitlist or other error
      const status = error.message.includes('already on the waitlist') ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    const row = data?.[0];
    return NextResponse.json({
      success: true,
      waitlistId: row?.waitlist_id,
      queuePosition: row?.queue_position,
    });
  } catch (error: any) {
    console.error('Unhandled error in waitlist join route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
