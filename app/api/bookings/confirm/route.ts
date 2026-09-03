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

    // Fetch real event details
    const { data: showData, error: showError } = await supabase
      .from('shows')
      .select('start_time, events(id, title), venues(name, location)')
      .eq('id', showId)
      .single();

    if (showError || !showData) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const startDate = new Date(showData.start_time);
    const eventData = Array.isArray(showData.events) ? showData.events[0] : showData.events;
    const venueData = Array.isArray(showData.venues) ? showData.venues[0] : showData.venues;
    const event = {
      id: eventData?.id,
      title: eventData?.title,
      venue: venueData?.name,
      city: venueData?.location,
      date: startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // MOCK BYPASS FOR LOCAL TESTING
    if (supabaseUrl.includes('placeholder')) {
      const qrCodeDataUrl = await generateTicketQRCode({ ref: bookingRef, event: event.id, show: showId });
      const seatsInfo = seatIds.map((id: string, index: number) => ({
        row: String.fromCharCode(65 + index),
        number: String(index + 1),
        category: 'Premium',
        price: 85.00
      }));
      const emailResult = await sendEmail({
        to: userEmail,
        subject: `Your Tickets for ${event.title} - ${bookingRef}`,
        react: React.createElement(TicketConfirmationEmail, {
          bookingRef,
          eventTitle: event.title,
          venueName: `${event.venue}, ${event.city}`,
          showDate: event.date,
          showTime: event.time,
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
      event: event.id,
      show: showId
    });

    // 3. Store QR URL in database
    await supabase
      .from('bookings')
      .update({ qr_code_url: qrCodeDataUrl })
      .eq('id', bookingId);

    // Fetch real seat info for the email template
    const { data: seatData } = await supabase
      .from('show_seats')
      .select('price, seats(row_identifier, seat_identifier, venue_sections(name))')
      .in('id', seatIds);

    const seatsInfo = (seatData || []).map((s: any) => ({
      row: s.seats?.row_identifier || '?',
      number: s.seats?.seat_identifier || '?',
      category: s.seats?.venue_sections?.name || 'Standard',
      price: Number(s.price)
    }));

    // 4. Asynchronously send transactional email
    const emailResult = await sendEmail({
      to: userEmail,
      subject: `Your Tickets for ${event.title} - ${bookingRef}`,
      react: React.createElement(TicketConfirmationEmail, {
        bookingRef,
        eventTitle: event.title,
        venueName: `${event.venue}, ${event.city}`,
        showDate: event.date,
        showTime: event.time,
        seats: seatsInfo,
        qrCodeDataUrl,
        passUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tickets/${bookingRef}`
      })
    });

    return NextResponse.json({ success: true, bookingId, emailDispatched: emailResult.success, mockHtml: emailResult.mockHtml });
  } catch (error: any  ) {
    console.error('Unhandled confirm error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
