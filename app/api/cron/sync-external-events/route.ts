import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase admin client to bypass RLS for background job
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const clientId = process.env.SEATGEEK_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json({ error: 'SEATGEEK_CLIENT_ID is not configured in environment variables.' }, { status: 400 });
    }

    // Fetch upcoming events from SeatGeek
    const res = await fetch(`https://api.seatgeek.com/2/events?client_id=${clientId}&per_page=10&datetime_utc.gte=${new Date().toISOString().split('.')[0]}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: 'Failed to fetch from SeatGeek', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    const externalEvents = data.events || [];

    if (externalEvents.length === 0) {
      return NextResponse.json({ message: 'No events found.' });
    }

    // Get a default venue to attach these events to (to reuse the SeatMap layout)
    const { data: venues } = await supabase.from('venues').select('id').limit(1);
    if (!venues || venues.length === 0) {
      return NextResponse.json({ error: 'No default venue found in the database. Run seed first.' }, { status: 500 });
    }
    const venueId = venues[0].id;

    // Get all seats for the default venue
    const { data: seats } = await supabase.from('seats').select('id, venue_sections(name)');
    const insertedShows = [];

    for (const ev of externalEvents) {
      // Check if event already exists to prevent duplicates (simple check by title)
      const { data: existingEvent } = await supabase.from('events').select('id').eq('title', ev.title).single();
      
      let eventId = existingEvent?.id;

      if (!eventId) {
        // Map category
        let category = 'activity';
        if (ev.type.includes('concert') || ev.type.includes('band')) category = 'concert';
        else if (ev.type.includes('sport') || ev.type.includes('nfl') || ev.type.includes('nba')) category = 'sport';
        else if (ev.type.includes('theater') || ev.type.includes('broadway')) category = 'play';

        const { data: newEvent, error: eventErr } = await supabase.from('events').insert({
          title: ev.short_title || ev.title,
          description: ev.title,
          event_type: category,
          image_url: ev.performers?.[0]?.image || 'https://images.unsplash.com/photo-1540039155733-d76e6c484947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }).select().single();

        if (eventErr) {
          console.error("Error inserting event:", eventErr);
          continue;
        }
        eventId = newEvent.id;
      }

      const startTime = new Date(ev.datetime_utc);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 3); // Assume 3 hour duration

      // Check if show already exists
      const { data: existingShow } = await supabase.from('shows').select('id').eq('event_id', eventId).eq('start_time', startTime.toISOString()).single();

      if (!existingShow) {
        const { data: newShow, error: showErr } = await supabase.from('shows').insert({
          event_id: eventId,
          venue_id: venueId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        }).select().single();

        if (showErr) {
          console.error("Error inserting show:", showErr);
          continue;
        }

        // Insert seats for this new show
        if (seats && seats.length > 0) {
          const showSeatsToInsert = seats.map(s => {
            const section: any = Array.isArray(s.venue_sections) ? s.venue_sections[0] : s.venue_sections;
            const secName = section?.name?.toLowerCase() || '';
            let price = 50.00;
            if (secName.includes('vip') || secName.includes('premium')) price = 150.00;
            else if (secName.includes('orchestra') || secName.includes('bowl')) price = 100.00;
            
            return {
              show_id: newShow.id,
              seat_id: s.id,
              status: 'available',
              price: price
            };
          });
          
          await supabase.from('show_seats').insert(showSeatsToInsert);
        }
        
        insertedShows.push(newShow.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synchronized ${insertedShows.length} new shows from SeatGeek.` 
    });

  } catch (error: any) {
    console.error("Error syncing events:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
