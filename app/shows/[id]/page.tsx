"use client";

import React, { useState, useEffect } from 'react';
import { SeatMap } from '../../../components/booking/SeatMap';
import { SeatLegend } from '../../../components/booking/SeatLegend';
import { BookingSummarySidebar } from '../../../components/booking/BookingSummarySidebar';
import { WaitlistModal } from '../../../components/booking/WaitlistModal';
import { useShowSeatsRealtime } from '../../../hooks/useShowSeatsRealtime';
import { ShowSeat } from '../../../types/booking';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '../../../lib/utils';

// Mock initial data for demonstration
const mockSeats: ShowSeat[] = [];
const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
rows.forEach((row, rIdx) => {
  for (let i = 1; i <= 20; i++) {
    let category: 'Standard' | 'Premium' | 'VIP' = 'Standard';
    let price = 45;
    
    if (rIdx >= 3 && rIdx <= 5) { category = 'Premium'; price = 85; }
    if (rIdx >= 6 && i >= 6 && i <= 15) { category = 'VIP'; price = 150; }
    
    // Random statuses for demo
    let status: 'available' | 'held' | 'booked' = 'available';
    const rand = Math.random();
    if (rand > 0.85) status = 'booked';
    else if (rand > 0.75) status = 'held';
    
    mockSeats.push({
      id: `55555555-5555-5555-5555-${(rIdx * 100 + i).toString().padStart(12, '0')}`,
      row,
      seatNumber: i.toString(),
      category,
      price,
      status,
      heldByMe: false
    });
  }
});

export default function ShowBookingPage() {
  const params = useParams();
  const router = useRouter();
  const showId = typeof params.id === 'string' ? params.id : 'default-show';
  const currentUserId = '11111111-1111-1111-1111-111111111111'; // Mock user id
  
  const { seats, optimisticHoldSeats } = useShowSeatsRealtime(showId, mockSeats);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [isHolding, setIsHolding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  // Waitlist State
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCategory, setWaitlistCategory] = useState<'VIP' | 'Premium' | 'Standard'>('VIP');

  const selectedSeats = seats.filter(s => selectedSeatIds.has(s.id));

  const handleSeatClick = (seat: ShowSeat) => {
    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      if (next.has(seat.id)) next.delete(seat.id);
      else next.add(seat.id);
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
        <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
          <div>
            <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 transition-colors mb-3">
              Live Booking
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Hans Zimmer Live</h1>
            <p className="text-zinc-400 text-sm md:text-base">O2 Arena, London • Friday, Aug 21, 2026 • 20:00</p>
          </div>
          <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
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
            />
          </div>

          {/* Sidebar */}
          <div className="shrink-0">
            <BookingSummarySidebar 
              selectedSeats={selectedSeats}
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
