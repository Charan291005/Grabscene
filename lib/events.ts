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

export function createDemoSeats(showId: string) {
  const seats = [];
  const isHansZimmer = showId === events[0].id;
  const isFredAgain = showId === events[1].id;
  const rows = isHansZimmer ? ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"] : ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = isFredAgain ? 16 : 20;

  for (const [rowIndex, row] of rows.entries()) {
    for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex += 1) {
      const category = isHansZimmer && rowIndex >= 7 ? "VIP" : rowIndex >= 5 ? "Premium" : "Standard";
      const price = category === "VIP" ? 150 : category === "Premium" ? 85 : 45;
      const status = (seatIndex + rowIndex) % 23 === 0 ? "booked" : (seatIndex + rowIndex) % 19 === 0 ? "held" : "available";

      seats.push({
        id: `${showId.slice(0, 8)}-seat-${row}-${seatIndex}`,
        row,
        seatNumber: String(seatIndex),
        category,
        price,
        status,
        heldByMe: false,
        section: isHansZimmer ? category : isFredAgain ? "Arena bowl" : "Main seating",
      });
    }
  }

  return seats;
}
