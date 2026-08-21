"use client";

import React, { useState } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { SeatCategory } from '../../types/booking';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: SeatCategory;
  showId: string;
}

export const WaitlistModal = ({ isOpen, onClose, category, showId }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Mock data for queue depth
  const queueDepth = category === 'VIP' ? 12 : category === 'Premium' ? 45 : 120;

  const handleJoin = async () => {
    setIsSubmitting(true);
    // Simulate API call to join waitlist via join_waitlist RPC
    await new Promise(res => setTimeout(res, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="waitlist-heading">
      <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
          aria-label="Close waitlist dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {!isSuccess ? (
          <>
            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
            
            <h2 id="waitlist-heading" className="text-2xl font-bold text-white mb-2 tracking-tight">Join the Waitlist</h2>
            <p className="text-zinc-400 mb-6">
              The {category} section is currently sold out. Join the waitlist to be notified instantly if a seat becomes available.
            </p>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-8 flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-500">Selected Category</p>
                <p className="font-semibold text-white">{category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Queue Depth</p>
                <p className="font-semibold text-cyan-400">{queueDepth} people ahead</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleJoin}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full py-3.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-all 
                bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Waitlist"}
            </button>
          </>
        ) : (
          <div className="text-center py-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You're on the list!</h2>
            <p className="text-zinc-400">
              We'll email you immediately if a {category} ticket becomes available. You will have 10 minutes to claim it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
