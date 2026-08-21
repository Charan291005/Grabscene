import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { WaitlistOfferEmail } from '@/components/emails/WaitlistOfferEmail';
import React from 'react';

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

    // MOCK BYPASS FOR LOCAL TESTING
    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        message: 'Booking cancelled (mock mode). Waitlist reallocation simulated.',
        reallocations: [],
      });
    }

    // Call the correct RPC: cancel_booking_and_reallocate
    const { data: result, error } = await supabase.rpc('cancel_booking_and_reallocate', {
      p_booking_id: bookingId,
      p_user_id: userId,
    });

    if (error) {
      console.error('Error cancelling booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // After cancellation, check if any waitlist entries were moved to 'offered' status
    // and send email notifications to those users
    const { data: offeredEntries } = await supabase
      .from('waitlist')
      .select(`
        id,
        user_id,
        offered_seat_id,
        offer_expires_at,
        show_id,
        section_id,
        profiles (email),
        show_seats (
          price,
          seats (
            row_identifier,
            seat_identifier,
            venue_sections (name)
          )
        ),
        shows (
          events (title),
          venues (name, location)
        )
      `)
      .eq('status', 'offered')
      .not('offer_expires_at', 'is', null)
      .gte('offer_expires_at', new Date().toISOString());

    if (offeredEntries && offeredEntries.length > 0) {
      for (const entry of offeredEntries) {
        const userEmail = (entry as any).profiles?.email;
        if (!userEmail) continue;

        const offerToken = entry.id; // Use waitlist ID as the claim token
        const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/claim?token=${offerToken}`;
        const eventTitle = (entry as any).shows?.events?.title ?? 'Event';
        const venueName = `${(entry as any).shows?.venues?.name ?? 'Venue'}, ${(entry as any).shows?.venues?.location ?? ''}`.trim();
        const seatCategory = (entry as any).show_seats?.seats?.venue_sections?.name ?? 'Standard';
        const seatRow = (entry as any).show_seats?.seats?.row_identifier ?? '?';
        const seatNumber = (entry as any).show_seats?.seats?.seat_identifier ?? '?';
        const price = Number((entry as any).show_seats?.price ?? 0);

        try {
          await sendEmail({
            to: userEmail,
            subject: `🎫 A seat just opened up for ${eventTitle}!`,
            react: React.createElement(WaitlistOfferEmail, {
              eventTitle,
              venueName,
              seatCategory,
              seatRow,
              seatNumber,
              price,
              claimUrl,
              expiresInMinutes: 10,
            }),
          });
          console.log(`[WAITLIST EMAIL] Sent offer to ${userEmail} for ${eventTitle}`);
        } catch (emailErr) {
          console.error(`Failed to send waitlist email to ${userEmail}:`, emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled and seats reallocated successfully.',
      reallocationsCount: offeredEntries?.length || 0,
    });
  } catch (error: any) {
    console.error('Unhandled error in cancel route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
