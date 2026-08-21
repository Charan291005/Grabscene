"use client";

import React, { useState } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { SeatCategory } from '../../types/booking';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: SeatCategory;
  showId: string;
  userId?: string;
  sectionId?: string;
}

export const WaitlistModal = ({ isOpen, onClose, category, showId, userId, sectionId }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!userId) {
      window.location.href = '/auth/login';
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          sectionId: sectionId || null,
          userId: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("You're already on the waitlist for this section.");
        } else {
          setError(data.error || 'Failed to join waitlist.');
        }
        setIsSubmitting(false);
        return;
      }

      setQueuePosition(data.queuePosition || null);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        onClose();
        // Reset state for next open
        setTimeout(() => {
          setIsSuccess(false);
          setQueuePosition(null);
          setError(null);
        }, 300);
      }, 3000);
    } catch {
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="waitlist-heading">
      <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button 
          type="button"
          onClick={() => { onClose(); setTimeout(() => { setIsSuccess(false); setError(null); setQueuePosition(null); }, 300); }}
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

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-500">Selected Category</p>
                <p className="font-semibold text-white">{category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Auto-assignment</p>
                <p className="font-semibold text-emerald-400">Enabled</p>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-8 text-sm text-amber-400/80">
              <p>When a seat opens, you'll receive an email with a <strong>10-minute time-limited link</strong> to claim it. If you don't act in time, it goes to the next person.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm" role="alert">
                {error}
              </div>
            )}

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
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h2>
            <p className="text-zinc-400">
              We'll email you immediately if a {category} ticket becomes available. You will have 10 minutes to claim it.
            </p>
            {queuePosition && (
              <p className="text-cyan-400 font-semibold mt-4">
                Your position: #{queuePosition}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
