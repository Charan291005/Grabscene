// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const premiumEvents = [
  {
    title: "Deadpool & Wolverine",
    event_type: "movie",
    description: "Marvel Studios presents their most significant mistake to date - Deadpool & Wolverine. A listless Wade Wilson toils away in civilian life. His days as the morally flexible mercenary, Deadpool, behind him. When his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    image_url: "https://m.media-amazon.com/images/M/MV5BNzRiMjg0MzUtNTQ1Mi00Y2Q5LWEwM2MtMzUwZDFjNjQwYzgwXkEyXkFqcGc@._V1_.jpg"
  },
  {
    title: "IPL 2026 Finals: CSK vs MI",
    event_type: "sport",
    description: "Experience the ultimate cricketing showdown as the two titans of the Indian Premier League clash in the grand finale. Witness history in the making with spectacular batting, breathtaking bowling, and electric stadium atmosphere.",
    image_url: "https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg"
  },
  {
    title: "Hamilton - The Musical",
    event_type: "play",
    description: "The story of America then, told by America now. Featuring a score that blends hip-hop, jazz, R&B, and show tunes, Hamilton has taken the story of American founding father Alexander Hamilton and created a revolutionary moment in theatre.",
    image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/8/83/Hamilton-poster.jpg/220px-Hamilton-poster.jpg"
  },
  {
    title: "Coldplay: Music of the Spheres",
    event_type: "concert",
    description: "Coldplay's record-breaking Music Of The Spheres World Tour arrives in your city. Expect a visually spectacular performance featuring lasers, fireworks, and LED wristbands, alongside classic hits and new anthems.",
    image_url: "https://upload.wikimedia.org/wikipedia/en/7/77/Coldplay_-_Music_of_the_Spheres.png"
  },
  {
    title: "Adrenaline Junkie Bungee Jump",
    event_type: "activity",
    description: "Take a leap of faith from India's highest fixed platform Bungee Jump. Operated by ex-Army professionals, safety and extreme thrill are guaranteed. Feel the ultimate rush of freefall!",
    image_url: "https://images.unsplash.com/photo-1522851610486-4f451f044bb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

async function seedData() {
  console.log("Seeding premium events...");
  
  const { data: venues } = await supabase.from('venues').select('id').limit(1);
  if (!venues || venues.length === 0) {
    console.error("No venues found. Run the base seed first.");
    return;
  }
  const venueId = venues[0].id;
  
  for (const ev of premiumEvents) {
    console.log(`Inserting ${ev.title}...`);
    const { data: eventData, error: eventErr } = await supabase.from('events').insert({
      title: ev.title,
      description: ev.description,
      event_type: ev.event_type,
      image_url: ev.image_url
    }).select().single();
    
    if (eventErr) {
      console.error("Error inserting event:", eventErr);
      continue;
    }
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1);
    startTime.setHours(19, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 3);
    
    const { data: showData, error: showErr } = await supabase.from('shows').insert({
      event_id: eventData.id,
      venue_id: venueId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    }).select().single();
    
    if (showErr) {
      console.error("Error inserting show:", showErr);
      continue;
    }
    
    const { data: seats } = await supabase.from('seats').select('id, venue_sections(name)');
    if (seats && seats.length > 0) {
      const showSeatsToInsert = seats.map(s => {
        const secName = s.venue_sections?.name?.toLowerCase() || '';
        let price = 50.00;
        if (secName.includes('vip') || secName.includes('premium') || secName.includes('golden')) price = 150.00;
        else if (secName.includes('orchestra') || secName.includes('bowl')) price = 100.00;
        
        return {
          show_id: showData.id,
          seat_id: s.id,
          status: 'available',
          price: price
        };
      });
      await supabase.from('show_seats').insert(showSeatsToInsert);
    }
  }
  console.log("Premium seeding complete!");
}

seedData();
