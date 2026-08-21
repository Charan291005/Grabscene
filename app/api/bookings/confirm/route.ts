import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateTicketQRCode } from '../../../../lib/qrcode';
import { sendEmail } from '../../../../lib/email';
import { TicketConfirmationEmail } from '../../../../components/emails/TicketConfirmationEmail';
import React from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function POST(request: Request) {
  try {
    const { showId, seatIds, userId, userEmail } = await request.json();

    if (!showId || !seatIds || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate secure booking reference on the server
    const bookingRef = `GS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // MOCK BYPASS FOR LOCAL TESTING
    if (supabaseUrl.includes('placeholder')) {
      const qrCodeDataUrl = await generateTicketQRCode({ ref: bookingRef, event: 'EV-1234', show: showId });
      const seatsInfo = seatIds.map((id: string, index: number) => ({
        row: String.fromCharCode(65 + index),
        number: String(index + 1),
        category: 'Premium',
        price: 85.00
      }));
      const emailResult = await sendEmail({
        to: userEmail,
        subject: `Your Tickets for Hans Zimmer Live - ${bookingRef}`,
        react: React.createElement(TicketConfirmationEmail, {
          bookingRef,
          eventTitle: 'Hans Zimmer Live',
          venueName: 'O2 Arena, London',
          showDate: 'Friday, Aug 21, 2026',
          showTime: '20:00',
          seats: seatsInfo,
          qrCodeDataUrl,
          passUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tickets/${bookingRef}`
        })
      });
      return NextResponse.json({ success: true, bookingId: 'mock-booking-id', emailDispatched: emailResult.success, mockHtml: emailResult.mockHtml });
    }

    // 1. Call confirm_booking RPC
    const { data: bookingId, error: rpcError } = await supabase.rpc('confirm_booking', {
      p_show_id: showId,
      p_seat_ids: seatIds,
      p_user_id: userId,
      p_booking_ref: bookingRef
    });

    if (rpcError) {
      console.error('Confirmation error:', rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }

    // 2. Generate secure QR Code string
    const qrCodeDataUrl = await generateTicketQRCode({
      ref: bookingRef,
      event: 'EV-1234',
      show: showId
    });

    // 3. Store QR URL in database
    await supabase
      .from('bookings')
      .update({ qr_code_url: qrCodeDataUrl })
      .eq('id', bookingId);

    // Prepare mock seat info for the email template
    const seatsInfo = seatIds.map((id: string, index: number) => ({
      row: String.fromCharCode(65 + index), // E.g., A, B, C
      number: String(index + 1),
      category: 'Premium',
      price: 85.00
    }));

    // 4. Asynchronously send transactional email
    const emailResult = await sendEmail({
      to: userEmail,
      subject: `Your Tickets for Hans Zimmer Live - ${bookingRef}`,
      react: React.createElement(TicketConfirmationEmail, {
        bookingRef,
        eventTitle: 'Hans Zimmer Live',
        venueName: 'O2 Arena, London',
        showDate: 'Friday, Aug 21, 2026',
        showTime: '20:00',
        seats: seatsInfo,
        qrCodeDataUrl,
        passUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tickets/${bookingRef}`
      })
    });

    return NextResponse.json({ success: true, bookingId, emailDispatched: emailResult.success, mockHtml: emailResult.mockHtml });
  } catch (error: any) {
    console.error('Unhandled confirm error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
