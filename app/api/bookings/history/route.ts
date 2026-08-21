import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // MOCK BYPASS FOR LOCAL TESTING
    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        bookings: [
          {
            id: 'bbbb9999-bbbb-9999-bbbb-9999bbbb9999',
            booking_ref: 'GS-DEMO-TEST',
            total_amount: 170.00,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            event_title: 'Event B (Sold-Out)',
            venue_name: 'CyberDome Arena',
            show_date: new Date(Date.now() + 2 * 86400000).toISOString(),
            seats: [
              { row: 'A', number: '1', category: 'Premium', price: 85.00 },
              { row: 'A', number: '2', category: 'Premium', price: 85.00 },
            ],
          },
        ],
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
        shows (
          start_time,
          events (title),
          venues (name)
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching booking history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bookings = (data || []).map((b: any) => ({
      id: b.id,
      booking_ref: b.booking_ref,
      total_amount: b.total_amount,
      status: b.status,
      created_at: b.created_at,
      event_title: b.shows?.events?.title ?? 'Unknown Event',
      venue_name: b.shows?.venues?.name ?? 'Unknown Venue',
      show_date: b.shows?.start_time ?? null,
      seats: (b.booking_items || []).map((item: any) => ({
        row: item.show_seats?.seats?.row_identifier ?? '?',
        number: item.show_seats?.seats?.seat_identifier ?? '?',
        category: item.show_seats?.seats?.venue_sections?.name ?? 'Standard',
        price: item.price,
      })),
    }));

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Unhandled error in history route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
