"use client";

import React, { useState, useEffect } from 'react';
import { SeatMap } from '../../../components/booking/SeatMap';
import { SeatLegend } from '../../../components/booking/SeatLegend';
import { BookingSummarySidebar } from '../../../components/booking/BookingSummarySidebar';
import { WaitlistModal } from '../../../components/booking/WaitlistModal';
import { useShowSeatsRealtime } from '../../../hooks/useShowSeatsRealtime';
import { ShowSeat } from '../../../types/booking';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '../../../lib/utils';
import { BrandLogo } from '../../../components/BrandLogo';
import { createDemoSeats, getEvent } from '../../../lib/events';

export default function ShowBookingPage() {
  const params = useParams();
  const router = useRouter();
  const showId = typeof params.id === 'string' ? params.id : 'default-show';
  const event = getEvent(showId);
  const [currentUserId] = useState(() => {
    if (typeof window === 'undefined') return 'demo-user';
    const existingUserId = window.sessionStorage.getItem('grabscene_demo_user');
    if (existingUserId) return existingUserId;
    const demoUsers = [
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
    ];
    const userId = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    window.sessionStorage.setItem('grabscene_demo_user', userId);
    return userId;
  });
  
  const { seats, optimisticHoldSeats } = useShowSeatsRealtime(showId, createDemoSeats(showId) as ShowSeat[], currentUserId);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [isHolding, setIsHolding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  // Waitlist State
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCategory, setWaitlistCategory] = useState<'VIP' | 'Premium' | 'Standard'>('VIP');

  const selectedSeats = seats.filter(s => selectedSeatIds.has(s.id));
  const availableSeats = seats.filter((seat) => seat.status === 'available').length;

  const handleSeatClick = (seat: ShowSeat) => {
    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else if (next.size < 8) {
        next.add(seat.id);
      } else {
        setToast({ message: 'You can select up to 8 tickets per booking.', type: 'error' });
      }
      return next;
    });
  };

  const handleProceed = async () => {
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
    <div className="min-h-screen bg-[#050810] flex flex-col p-4 md:p-6 lg:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0a151d]/90 p-4 shadow-xl backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo compact />
            <div className="min-w-0">
            <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 transition-colors mb-3">
              Live Booking · {availableSeats} seats available
            </div>
              <h1 className="truncate text-2xl font-bold tracking-tight text-white md:text-3xl">{event.title}</h1>
              <p className="truncate text-sm text-zinc-400">{event.venue}, {event.city} · {event.date} · {event.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:shrink-0">
            <div className="relative hidden h-16 w-28 overflow-hidden rounded-lg border border-white/10 sm:block">
              <Image src={event.image} alt={`${event.title} event artwork`} fill className="object-cover" sizes="112px" />
            </div>
            <SeatLegend />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
          
          {/* Seat Map Container */}
          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl bg-[#090D16] border border-zinc-800/50">
            <SeatMap 
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              onSeatClick={handleSeatClick}
              layout={showId === '55551111-5555-1111-5555-111155551111' ? 'concert' : showId === '55556666-5555-6666-5555-666655556666' ? 'arena' : 'theater'}
            />
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
          />
        </div>
      </div>
    </div>
  );
}
