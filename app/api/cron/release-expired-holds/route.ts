import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const CRON_SECRET = process.env.CRON_SECRET || 'dev_cron_secret';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // In a real environment, verify the bearer token matches CRON_SECRET
    if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the RPC to release expired holds
    const { data: freedSeatIds, error } = await supabase.rpc('release_expired_holds');

    if (error) {
      console.error('Error releasing expired holds:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      freedSeatsCount: freedSeatIds?.length || 0,
      freedSeatIds: freedSeatIds || []
    });

  } catch (error: any) {
    console.error('Unhandled error in cron route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
