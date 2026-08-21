import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;

    if (!ref) {
      return NextResponse.json({ error: 'Missing booking reference' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // MOCK BYPASS
    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        booking: {
          id: 'mock-booking-id',
          booking_ref: ref,
          total_amount: 170.00,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          event_title: 'Hans Zimmer Live',
          venue_name: 'O2 Arena, London',
          show_date: 'Friday, Aug 21, 2026',
          show_time: '20:00',
          seats: [
            { row: 'A', number: '12', category: 'VIP', price: 150.00 },
          ],
          qr_code_url: null,
        },
      });
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_ref,
        total_amount,
        status,
        created_at,
        qr_code_url,
        shows (
          start_time,
          end_time,
          events (title),
          venues (name, location)
        ),
        booking_items (
          price,
          show_seats (
            seats (
              row_identifier,
              seat_identifier,
              venue_sections (name)
            )
          )
        )
      `)
      .eq('booking_ref', ref)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const showsObj = Array.isArray(data.shows) ? data.shows[0] : data.shows;
    const startTime = (showsObj as any)?.start_time;

    const showDate = startTime
      ? new Date(startTime).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown Date';

    const showTime = startTime
      ? new Date(startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : 'Unknown Time';

    const booking = {
      id: data.id,
      booking_ref: data.booking_ref,
      total_amount: data.total_amount,
      status: data.status,
      created_at: data.created_at,
      event_title: (showsObj as any)?.events?.title ?? 'Unknown Event',
      venue_name: `${(showsObj as any)?.venues?.name ?? 'Unknown'}, ${(showsObj as any)?.venues?.location ?? ''}`.trim(),
      show_date: showDate,
      show_time: showTime,
      qr_code_url: data.qr_code_url,
      seats: ((data as any).booking_items || []).map((item: any) => ({
        row: item.show_seats?.seats?.row_identifier ?? '?',
        number: item.show_seats?.seats?.seat_identifier ?? '?',
        category: item.show_seats?.seats?.venue_sections?.name ?? 'Standard',
        price: item.price,
      })),
    };

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Unhandled error in booking detail route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
