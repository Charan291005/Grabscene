import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function POST(request: Request) {
  try {
    const { title, description, eventType, venueId, startTime, endTime, pricing, organiserId } = await request.json();

    if (!title || !venueId || !startTime || !organiserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // MOCK BYPASS
    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        eventId: 'mock-event-id',
        showId: 'mock-show-id',
        seatsGenerated: 0,
      });
    }

    // 1. Create event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        organiser_id: organiserId,
        title,
        description: description || null,
        event_type: eventType || 'concert',
      })
      .select('id')
      .single();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    const eventId = eventData.id;

    // 2. Create show
    const computedEndTime = endTime || new Date(new Date(startTime).getTime() + 3 * 3600000).toISOString();

    const { data: showData, error: showError } = await supabase
      .from('shows')
      .insert({
        event_id: eventId,
        venue_id: venueId,
        start_time: startTime,
        end_time: computedEndTime,
      })
      .select('id')
      .single();

    if (showError) {
      return NextResponse.json({ error: showError.message }, { status: 500 });
    }

    const showId = showData.id;

    // 3. Generate show_seats from venue's physical seats with per-category pricing
    const { data: venueSeats, error: seatsFetchError } = await supabase
      .from('seats')
      .select('id, section_id, venue_sections(name)')
      .eq('section_id', venueId)  // We need to match by venue
      .order('id');

    // Actually, seats belong to sections which belong to venues. Let's query properly.
    const { data: sections } = await supabase
      .from('venue_sections')
      .select('id, name')
      .eq('venue_id', venueId);

    if (!sections || sections.length === 0) {
      return NextResponse.json({ success: true, eventId, showId, seatsGenerated: 0 });
    }

    const sectionIds = sections.map((s: any) => s.id);
    const { data: allSeats } = await supabase
      .from('seats')
      .select('id, section_id')
      .in('section_id', sectionIds);

    if (!allSeats || allSeats.length === 0) {
      return NextResponse.json({ success: true, eventId, showId, seatsGenerated: 0 });
    }

    // Build section name lookup and pricing map
    const sectionNameMap: Record<string, string> = {};
    for (const s of sections) {
      sectionNameMap[s.id] = s.name;
    }

    const defaultPricing: Record<string, number> = {
      VIP: 150,
      Premium: 85,
      Standard: 45,
    };

    const pricingMap = pricing || {};

    const showSeatsToInsert = allSeats.map((seat: any) => {
      const sectionName = sectionNameMap[seat.section_id] || 'Standard';
      const price = pricingMap[sectionName] || defaultPricing[sectionName] || 45;
      return {
        show_id: showId,
        seat_id: seat.id,
        status: 'available',
        price,
      };
    });

    const { error: insertError } = await supabase
      .from('show_seats')
      .insert(showSeatsToInsert);

    if (insertError) {
      console.error('Error inserting show_seats:', insertError);
    }

    return NextResponse.json({
      success: true,
      eventId,
      showId,
      seatsGenerated: showSeatsToInsert.length,
    });
  } catch (error: any) {
    console.error('Unhandled error in event create route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
