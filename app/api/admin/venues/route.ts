import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// GET: List all venues with sections
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        venues: [
          {
            id: 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111',
            name: 'Grand Horizon IMAX Cinema',
            location: 'New York',
            sections: [
              { id: 'cccc3333-cccc-3333-cccc-3333cccc3333', name: 'VIP', seatCount: 2 },
              { id: 'dddd4444-dddd-4444-dddd-4444dddd4444', name: 'Standard', seatCount: 2 },
            ],
          },
          {
            id: 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222',
            name: 'CyberDome Arena',
            location: 'London',
            sections: [
              { id: 'ffff6666-ffff-6666-ffff-6666ffff6666', name: 'Premium', seatCount: 2 },
            ],
          },
        ],
      });
    }

    const { data, error } = await supabase
      .from('venues')
      .select('id, name, location, venue_sections(id, name, seats(count))')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const venues = (data || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      location: v.location,
      sections: (v.venue_sections || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        seatCount: s.seats?.[0]?.count ?? 0,
      })),
    }));

    return NextResponse.json({ venues });
  } catch (error: any) {
    console.error('Unhandled error in venues route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new venue with sections and seats
export async function POST(request: Request) {
  try {
    const { name, location, sections } = await request.json();

    if (!name || !sections || sections.length === 0) {
      return NextResponse.json({ error: 'Missing venue name or sections' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ success: true, venueId: 'mock-venue-id' });
    }

    // 1. Create venue
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .insert({ name, location: location || null })
      .select('id')
      .single();

    if (venueError) {
      return NextResponse.json({ error: venueError.message }, { status: 500 });
    }

    const venueId = venueData.id;

    // 2. Create sections and seats
    for (const section of sections) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('venue_sections')
        .insert({ venue_id: venueId, name: section.name })
        .select('id')
        .single();

      if (sectionError) {
        console.error('Section creation error:', sectionError);
        continue;
      }

      const sectionId = sectionData.id;
      const rows = section.rows || 5;
      const seatsPerRow = section.seatsPerRow || 10;

      const seatsToInsert = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let s = 1; s <= seatsPerRow; s++) {
          seatsToInsert.push({
            section_id: sectionId,
            row_identifier: rowLabel,
            seat_identifier: String(s),
          });
        }
      }

      if (seatsToInsert.length > 0) {
        const { error: seatsError } = await supabase.from('seats').insert(seatsToInsert);
        if (seatsError) {
          console.error('Seats creation error:', seatsError);
        }
      }
    }

    return NextResponse.json({ success: true, venueId });
  } catch (error: any) {
    console.error('Unhandled error in venue creation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
