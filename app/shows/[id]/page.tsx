"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const SeatMap = dynamic(() => import('../../../components/booking/SeatMap').then(m => m.SeatMap), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-bms-red/20 border-t-bms-red mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Seat Layout...</p>
      </div>
    </div>
  )
});
import { SeatLegend } from '../../../components/booking/SeatLegend';
import { BookingSummarySidebar } from '../../../components/booking/BookingSummarySidebar';
import { WaitlistModal } from '../../../components/booking/WaitlistModal';
import { useShowSeatsRealtime } from '../../../hooks/useShowSeatsRealtime';
import { ShowSeat } from '../../../types/booking';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '../../../lib/utils';
import { BrandLogo } from '../../../components/BrandLogo';

export default function ShowBookingPage() {
  const params = useParams();
  const router = useRouter();
  const showId = typeof params.id === 'string' ? params.id : '';
  const [event, setEvent] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    import('../../../lib/supabase-browser').then(({ supabaseBrowser }) => {
      supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
        setCurrentUserId(session?.user?.id || null);
      });
      
      const {
        data: { subscription },
      } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
        setCurrentUserId(session?.user?.id || null);
      });

      // Fetch Show and Event details
      if (showId) {
        supabaseBrowser
          .from('shows')
          .select('id, start_time, events (id, title, description, image_url, event_type), venues (name, location)')
          .eq('id', showId)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              const startDate = new Date(data.start_time);
              const eventData = Array.isArray(data.events) ? data.events[0] : data.events;
              const venueData = Array.isArray(data.venues) ? data.venues[0] : data.venues;
              setEvent({
                id: eventData?.id,
                title: eventData?.title,
                description: eventData?.description,
                image: eventData?.image_url || '/events/hans-zimmer.jpg',
                category: eventData?.event_type === 'concert' ? 'Events' 
                        : eventData?.event_type === 'movie' ? 'Movies' 
                        : eventData?.event_type === 'play' ? 'Plays'
                        : eventData?.event_type === 'sport' ? 'Sports'
                        : 'Activities',
                date: startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
                time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                venue: venueData?.name,
                city: venueData?.location,
              });
            }
          });
      }

      return () => subscription.unsubscribe();
    });
  }, [showId]);
  
  const { seats, optimisticHoldSeats, isLoading: seatsLoading } = useShowSeatsRealtime(showId, currentUserId || '');
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [isHolding, setIsHolding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  // Waitlist State
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCategory, setWaitlistCategory] = useState<'VIP' | 'Premium' | 'Standard'>('VIP');

  const selectedSeats = seats.filter(s => selectedSeatIds.has(s.id));
  const availableSeats = seats.filter((seat) => seat.status === 'available').length;

  const handleSeatClick = (seatId: string) => {
    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else if (next.size < 8) {
        next.add(seatId);
      } else {
        setToast({ message: 'You can select up to 8 tickets per booking.', type: 'error' });
      }
      return next;
    });
  };

  const handleProceed = async () => {
    if (!currentUserId) {
      router.push('/auth/login');
      return;
    }
    
    setIsHolding(true);
    setToast(null);
    const ids = Array.from(selectedSeatIds);
    
    const result = await optimisticHoldSeats(ids, currentUserId);
    
    setIsHolding(false);
    if (result.success) {
      setToast({ message: 'Seats held successfully for 10 minutes.', type: 'success' });
      // Save actual selected seats to sessionStorage so the checkout page can display them dynamically
      sessionStorage.setItem('grabscene_pending_seats', JSON.stringify(selectedSeats));
      sessionStorage.setItem('grabscene_pending_event', JSON.stringify(event));
      sessionStorage.setItem('grabscene_pending_user', currentUserId);
      // Redirect to checkout to complete the integration flow
      setTimeout(() => {
        router.push(`/checkout/hold-${Date.now()}`);
      }, 1000);
    } else {
      setToast({ message: `Conflict: ${result.error}`, type: 'error' });
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6 lg:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between transition-all">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo compact />
            {event ? (
              <div className="min-w-0">
                <div className="inline-flex items-center rounded-full border border-bms-red/20 bg-bms-red/5 px-2.5 py-0.5 text-[11px] font-bold text-bms-red uppercase tracking-wider transition-colors mb-3">
                  Live Booking · {availableSeats} seats available
                </div>
                <h1 className="truncate text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{event.title}</h1>
                <p className="truncate text-[14px] font-medium text-slate-500 mt-1">{event.venue}, {event.city} · {event.date} · {event.time}</p>
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-slate-200 rounded-md w-64"></div>
                <div className="h-4 bg-slate-200 rounded-md w-48"></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-5 lg:shrink-0">
            {event && (
              <div className="relative hidden h-20 w-32 overflow-hidden rounded-lg border border-slate-200 shadow-sm sm:block">
                <Image src={event.image} alt={`${event.title} event artwork`} fill className="object-cover" sizes="128px" />
              </div>
            )}
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <SeatLegend />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        {(!event || seatsLoading) ? (
          <div className="flex-1 flex items-center justify-center border border-slate-200 bg-white rounded-xl shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-bms-red/20 border-t-bms-red rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Loading venue layout...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
          
          {/* Main Left Column */}
          <div className="flex-1 flex flex-col gap-6 relative min-h-0">
            {/* About Event Card */}
            {event.description && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 shrink-0">
                <h3 className="text-lg font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">About this Event</h3>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Seat Map Container */}
            <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm bg-[#F8FAFC] border border-slate-200 ring-1 ring-slate-900/5 min-h-[400px]">
              <SeatMap 
                seats={seats}
                selectedSeatIds={Array.from(selectedSeatIds)}
                onSeatClick={handleSeatClick}
                layout={event.category === 'Sports' ? 'arena' : event.category === 'Events' ? 'concert' : 'theater'}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="shrink-0">
            <BookingSummarySidebar 
              selectedSeats={selectedSeats}
              maxTickets={8}
              onProceed={handleProceed}
              isLoading={isHolding}
              onOpenWaitlist={(category) => {
                setWaitlistCategory(category);
                setIsWaitlistOpen(true);
              }}
            />
          </div>

          {/* Toast Notification */}
          <div className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-50",
            toast ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
          )}>
            <div className={cn(
              "px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-medium",
              toast?.type === 'error' ? "bg-red-500/10 border-red-500/50 text-red-200" : "bg-emerald-500/10 border-emerald-500/50 text-emerald-200"
            )}>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]",
                toast?.type === 'error' ? "bg-red-500" : "bg-emerald-500"
              )} />
              {toast?.message}
            </div>
          </div>

          {/* Waitlist Modal */}
          <WaitlistModal 
            isOpen={isWaitlistOpen}
            onClose={() => setIsWaitlistOpen(false)}
            category={waitlistCategory}
            showId={showId}
            userId={currentUserId || ''}
            />
          </div>
        )}
      </div>
    </div>
  );
}

