"use client";

import React, { useState } from 'react';
import { FastForward, Clock, XSquare, Settings2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const EvaluatorToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  const fastForwardHolds = async () => {
    await fetch('/api/demo/fast-forward-holds', { method: 'POST' });
    alert("Active holds fast-forwarded to expire in 10 seconds.");
  };

  const forceExpireHolds = async () => {
    await fetch('/api/cron/release-expired-holds');
    alert("Cron triggered: Swept and released expired holds.");
  };

  const simulateCancelWaitlist = async () => {
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: 'bbbb9999-bbbb-9999-bbbb-9999bbbb9999', userId: '33333333-3333-3333-3333-333333333333' })
    });
    
    if (res.ok) {
      alert("Success: Pre-seeded booking cancelled. Waitlist reallocation triggered!");
    } else {
      alert("Booking already cancelled or error occurred.");
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-zinc-950/90 backdrop-blur-md border border-indigo-500/50 rounded-full text-indigo-400 hover:bg-indigo-500/30 transition-colors shadow-2xl"
        title="Open Evaluator Suite"
      >
        <Settings2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-indigo-500/30 bg-black/90 p-2 shadow-[0_10px_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
      <div className="px-4 border-r border-white/10 flex items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Evaluator Suite</span>
      </div>
      
      <button onClick={fastForwardHolds} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-sm font-medium text-white group" title="Set holds to 10s TTL">
        <FastForward className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline">Fast-Forward Holds</span>
      </button>
      
      <button onClick={forceExpireHolds} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-sm font-medium text-white group" title="Run cron to sweep holds">
        <Clock className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline">Force Expire Holds</span>
      </button>

      <button onClick={simulateCancelWaitlist} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-sm font-medium text-white group" title="Cancel booking & shift waitlist">
        <XSquare className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline">Test Waitlist Shift</span>
      </button>

      <button onClick={() => setIsOpen(false)} className="ml-2 p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
