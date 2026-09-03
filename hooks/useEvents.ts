import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type CatalogEvent = {
  id: string; // This will actually map to the SHOW id so clicking it goes to /shows/[id]
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  priceFrom: number;
  description: string;
  featured: boolean;
};

export function useEvents() {
  const [events, setEvents] = useState<CatalogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from('shows')
          .select(`
            id,
            start_time,
            events ( title, event_type, image_url, description ),
            venues ( name, location )
          `)
          .order('start_time', { ascending: true });

        if (error) {
          console.error("Error fetching catalog events:", error);
          return;
        }

        if (data) {
          const mappedEvents: CatalogEvent[] = data.map((show: any, index: number) => {
            const startDate = new Date(show.start_time);
            return {
              id: show.id, // Use show_id for routing
              title: show.events?.title || 'Unknown Event',
              category: show.events?.event_type === 'concert' ? 'Events' 
                      : show.events?.event_type === 'movie' ? 'Movies' 
                      : show.events?.event_type === 'play' ? 'Plays'
                      : show.events?.event_type === 'sport' ? 'Sports'
                      : 'Activities',
              date: startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
              time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              venue: show.venues?.name || 'Unknown Venue',
              city: show.venues?.location || 'Unknown Location',
              image: show.events?.image_url || '/events/hans-zimmer.jpg', // Fallback
              priceFrom: 45, // Hardcoded for now without a complex subquery
              description: show.events?.description || '',
              featured: index < 5, // Feature the top 5 upcoming shows
            };
          });
          setEvents(mappedEvents);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, isLoading };
}
