import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, userId } = body;

    if (!bookingId || !userId) {
      return NextResponse.json({ error: 'Missing bookingId or userId' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the RPC to reallocate the cancelled seat
    const { data: reallocations, error } = await supabase.rpc('reallocate_cancelled_seat', {
      p_booking_id: bookingId
    });

    if (error) {
      console.error('Error reallocating seat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mock Email Dispatch for each reallocated seat
    if (reallocations && reallocations.length > 0) {
      reallocations.forEach((reallocation: any) => {
        const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/claim?token=${reallocation.offer_token}`;
        
        console.log(`[MOCK EMAIL RESEND] Sent to User ID: ${reallocation.user_id}`);
        console.log(`Subject: A seat just opened up for Hans Zimmer Live!`);
        console.log(`Body: Good news! A seat you waitlisted for just became available. You have 10 minutes to claim it here: ${claimUrl}`);
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking cancelled and seats reallocated successfully.',
      reallocations 
    });

  } catch (error: any) {
    console.error('Unhandled error in cancel route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
