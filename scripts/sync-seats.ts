import { createClient } from '@supabase/supabase-js';
import { events, createDemoSeats } from '../lib/events';
import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSeats() {
  for (const event of events) {
    console.log(`Syncing seats for ${event.title}...`);
    
    // Generate dynamic geometry seats
    const mockSeats = createDemoSeats(event.id);
    
    // First, delete existing show_seats for this event
    const { error: delError } = await supabase
      .from('show_seats')
      .delete()
      .eq('show_id', event.id);
      
    if (delError) {
      console.error(`Error deleting show_seats for ${event.title}:`, delError);
      continue;
    }
    
    console.log(`Cleared old seats for ${event.title}. Inserting ${mockSeats.length} new dynamic seats...`);
    
    const venueId = 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111'; // using the default mock venue
    
    // 1. Collect unique sections
    const uniqueSections = Array.from(new Set(mockSeats.map(s => s.section)));
    
    const sectionIds: Record<string, string> = {};
    for (const sec of uniqueSections) {
      // try to insert
      const id = crypto.randomUUID();
      await supabase.from('venue_sections').upsert({
        id,
        venue_id: venueId,
        name: sec
      }, { onConflict: 'venue_id,name' });
      
      const { data } = await supabase.from('venue_sections').select('id').eq('venue_id', venueId).eq('name', sec).single();
      if (data) sectionIds[sec] = data.id;
    }
    
    // 2. Insert seats
    const dbSeats = mockSeats.map(s => ({
      id: s.id, // using our deterministic mock ID
      section_id: sectionIds[s.section],
      row_identifier: s.row,
      seat_identifier: s.seatNumber
    }));
    
    // Batch insert seats (upsert to be safe)
    const { error: seatsErr } = await supabase.from('seats').upsert(dbSeats);
    if (seatsErr) console.error("Error inserting seats:", seatsErr);
    
    // 3. Insert show_seats
    const dbShowSeats = mockSeats.map(s => ({
      show_id: event.id,
      seat_id: s.id,
      status: s.status === 'available' ? 'available' : s.status === 'booked' ? 'booked' : 'available',
      price: s.price
    }));
    
    // Batch insert show_seats
    const { error: ssErr } = await supabase.from('show_seats').insert(dbShowSeats);
    if (ssErr) {
        console.error("Error inserting show_seats:", ssErr);
    } else {
        console.log(`Successfully synced ${dbShowSeats.length} seats for ${event.title}`);
    }
  }
}

syncSeats().then(() => console.log('Done'));
