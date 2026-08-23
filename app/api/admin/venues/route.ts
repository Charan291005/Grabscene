import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// GET: List all venues with sections
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('venues')
      .select('id, name, location, venue_sections(id, name, seats(count))')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const venues = (data || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      location: v.location,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sections: (v.venue_sections || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        seatCount: s.seats?.[0]?.count ?? 0,
      })),
    }));

    return NextResponse.json({ venues });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Unhandled error in venues route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new venue with sections and seats
export async function POST(request: Request) {
  try {
    const { name, location, sections, userId } = await request.json();

    if (!name || !sections || sections.length === 0) {
      return NextResponse.json({ error: 'Missing venue name or sections' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Missing userId' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Unhandled error in venue creation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
