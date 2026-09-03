import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: show } = await supabase
    .from('shows')
    .select('start_time, events(title, description, image_url), venues(name, location)')
    .eq('id', id)
    .single();

  if (!show) {
    return {
      title: 'Show Not Found',
    };
  }

  const event = Array.isArray(show.events) ? show.events[0] : show.events;
  const venue = Array.isArray(show.venues) ? show.venues[0] : show.venues;

  return {
    title: event?.title || 'Event Booking',
    description: event?.description || `Book tickets for ${event?.title} at ${venue?.name}`,
    openGraph: {
      title: event?.title,
      description: event?.description || `Book tickets for ${event?.title} at ${venue?.name}`,
      images: event?.image_url ? [event.image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: event?.title,
      description: event?.description,
      images: event?.image_url ? [event.image_url] : [],
    }
  };
}

export default function ShowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
