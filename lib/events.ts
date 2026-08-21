export type EventCategory = "Concerts" | "Sports" | "Theater" | "Festivals";

export type CatalogEvent = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  dateTime: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  tags: string[];
  priceFrom: number;
  featured?: boolean;
  description: string;
};

export const events: CatalogEvent[] = [
  {
    id: "55551111-5555-1111-5555-111155551111",
    title: "Hans Zimmer Live",
    category: "Concerts",
    date: "Friday, Aug 21, 2026",
    dateTime: "2026-08-21T20:00:00+01:00",
    time: "20:00",
    venue: "O2 Arena",
    city: "London",
    image: "/events/hans-zimmer.jpg",
    tags: ["Orchestral", "Live Music"],
    priceFrom: 45,
    featured: true,
    description: "A cinematic live orchestra experience featuring the music of Hans Zimmer.",
  },
  {
    id: "55556666-5555-6666-5555-666655556666",
    title: "Fred Again..",
    category: "Concerts",
    date: "Saturday, Sep 05, 2026",
    dateTime: "2026-09-05T19:30:00+01:00",
    time: "19:30",
    venue: "Wembley Stadium",
    city: "London",
    image: "/events/fred-again.jpg",
    tags: ["Electronic", "Dance"],
    priceFrom: 60,
    description: "An immersive electronic set built for a stadium-sized singalong.",
  },
  {
    id: "55553333-5555-3333-5555-333355553333",
    title: "The Weeknd: After Hours",
    category: "Concerts",
    date: "Monday, Oct 12, 2026",
    dateTime: "2026-10-12T20:00:00-04:00",
    time: "20:00",
    venue: "Madison Square Garden",
    city: "New York",
    image: "/events/the-weeknd.jpg",
    tags: ["Pop", "R&B"],
    priceFrom: 75,
    description: "The After Hours atmosphere arrives for one unforgettable night in New York.",
  },
  {
    id: "55554444-5555-4444-5555-444455554444",
    title: "Coldplay: Spheres Tour",
    category: "Festivals",
    date: "Wednesday, Nov 18, 2026",
    dateTime: "2026-11-18T19:00:00-05:00",
    time: "19:00",
    venue: "Estadio Nacional",
    city: "Lima",
    image: "/events/coldplay.jpg",
    tags: ["Rock", "Stadium"],
    priceFrom: 55,
    description: "A vivid stadium show with anthems, lights, and a planet-sized production.",
  },
];

export function getEvent(eventId: string) {
  return events.find((event) => event.id === eventId) ?? events[0];
}

export function formatPrice(price: number) {
  return `From $${price}`;
}

function generateSeatUUID(showId: string, row: string, seat: number): string {
  // Simple deterministic UUID generator for the frontend/backend match
  const str = `${showId}-${row}-${seat}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const base = showId.slice(8); // Use the rest of the showId to pad
  const combined = (hex + base.replace(/-/g, '') + '00000000000000000000000000000000').toLowerCase();
  
  return `${combined.slice(0,8)}-${combined.slice(8,12)}-4${combined.slice(13,16)}-a${combined.slice(17,20)}-${combined.slice(20,32)}`;
}

export function createDemoSeats(showId: string) {
  const seats: any[] = [];
  
  if (showId === events[0].id) {
    // Hans Zimmer (Theater) - Curved seating with Orchestra & Balcony
    const sections = [
      { name: "Orchestra", rows: ["A", "B", "C", "D"], seatsPerRow: [12, 14, 16, 18], category: "VIP", basePrice: 150 },
      { name: "Mezzanine", rows: ["E", "F", "G"], seatsPerRow: [20, 22, 24], category: "Premium", basePrice: 95 },
      { name: "Balcony", rows: ["H", "J", "K", "L"], seatsPerRow: [26, 28, 28, 30], category: "Standard", basePrice: 55 },
    ];
    let seatIndexOverall = 0;
    for (const section of sections) {
      for (let i = 0; i < section.rows.length; i++) {
        const row = section.rows[i];
        const numSeats = section.seatsPerRow[i];
        for (let seat = 1; seat <= numSeats; seat++) {
          seatIndexOverall++;
          seats.push({
            id: generateSeatUUID(showId, row, seat),
            row, seatNumber: String(seat),
            category: section.category, price: section.basePrice,
            status: seatIndexOverall % 19 === 0 ? "held" : seatIndexOverall % 13 === 0 ? "booked" : "available",
            heldByMe: false, section: section.name,
          });
        }
      }
    }
  } else if (showId === events[1].id) {
    // Fred Again (Arena 360) - Four sides
    const sections = [
      { name: "North Bowl", rows: ["NA", "NB", "NC"], seatsPerRow: 20, category: "Premium", basePrice: 85 },
      { name: "South Bowl", rows: ["SA", "SB", "SC"], seatsPerRow: 20, category: "Premium", basePrice: 85 },
      { name: "East VIP", rows: ["EA", "EB"], seatsPerRow: 12, category: "VIP", basePrice: 160 },
      { name: "West VIP", rows: ["WA", "WB"], seatsPerRow: 12, category: "VIP", basePrice: 160 },
    ];
    let seatIndexOverall = 0;
    for (const section of sections) {
      for (const row of section.rows) {
        for (let seat = 1; seat <= section.seatsPerRow; seat++) {
          seatIndexOverall++;
          seats.push({
            id: generateSeatUUID(showId, row, seat),
            row, seatNumber: String(seat),
            category: section.category, price: section.basePrice,
            status: seatIndexOverall % 17 === 0 ? "held" : seatIndexOverall % 11 === 0 ? "booked" : "available",
            heldByMe: false, section: section.name,
          });
        }
      }
    }
  } else if (showId === events[2].id) {
    // The Weeknd (Concert) - Deep Thrust Stage
    const sections = [
      { name: "Golden Circle", rows: ["Pit1", "Pit2"], seatsPerRow: [10, 14], category: "VIP", basePrice: 200 },
      { name: "Lower Tier", rows: ["L1", "L2", "L3", "L4"], seatsPerRow: [24, 26, 28, 30], category: "Premium", basePrice: 120 },
      { name: "Upper Tier", rows: ["U1", "U2", "U3", "U4", "U5"], seatsPerRow: [32, 34, 34, 36, 38], category: "Standard", basePrice: 75 },
    ];
    let seatIndexOverall = 0;
    for (const section of sections) {
      for (let i = 0; i < section.rows.length; i++) {
        const row = section.rows[i];
        const numSeats = section.seatsPerRow[i];
        for (let seat = 1; seat <= numSeats; seat++) {
          seatIndexOverall++;
          seats.push({
            id: generateSeatUUID(showId, row, seat),
            row, seatNumber: String(seat),
            category: section.category, price: section.basePrice,
            status: seatIndexOverall % 23 === 0 ? "held" : seatIndexOverall % 15 === 0 ? "booked" : "available",
            heldByMe: false, section: section.name,
          });
        }
      }
    }
  } else {
    // Coldplay (Stadium) - Massive flat width
    const sections = [
      { name: "Field GA", rows: ["F1", "F2", "F3"], seatsPerRow: 35, category: "VIP", basePrice: 180 },
      { name: "Level 100", rows: ["101", "102", "103", "104"], seatsPerRow: 40, category: "Premium", basePrice: 110 },
      { name: "Level 200", rows: ["201", "202", "203", "204", "205"], seatsPerRow: 45, category: "Standard", basePrice: 65 },
    ];
    let seatIndexOverall = 0;
    for (const section of sections) {
      for (const row of section.rows) {
        for (let seat = 1; seat <= section.seatsPerRow; seat++) {
          seatIndexOverall++;
          seats.push({
            id: generateSeatUUID(showId, row, seat),
            row, seatNumber: String(seat),
            category: section.category, price: section.basePrice,
            status: seatIndexOverall % 25 === 0 ? "held" : seatIndexOverall % 19 === 0 ? "booked" : "available",
            heldByMe: false, section: section.name,
          });
        }
      }
    }
  }

  return seats;
}
