"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HoldCountdownTimer } from '../../../components/booking/HoldCountdownTimer';
import { Clock, CheckCircle2 } from 'lucide-react';

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  // Mocking the offer state for demonstration purposes
  const [isValidating, setIsValidating] = useState(true);
  const [offerData, setOfferData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate validating the offer token against the database
    setTimeout(() => {
      if (token === 'expired') {
        setOfferData(null); // Invalid or expired token
      } else {
        setOfferData({
          seat: { row: 'A', number: '12', category: 'VIP', price: 150 },
          expiresAt: new Date(Date.now() + 9 * 60 * 1000 + 45000).toISOString() // ~9m 45s remaining
        });
      }
      setIsValidating(false);
    }, 1500);
  }, [token]);

  // Hook for the countdown timer based on the server-provided expiresAt
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!offerData?.expiresAt) return;
    const expiresAt = new Date(offerData.expiresAt).getTime();

    const calculateRemaining = () => Math.max(0, expiresAt - Date.now());

    const initial = calculateRemaining();
    setRemainingMs(initial);
    if (initial <= 0) setIsExpired(true);

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [offerData?.expiresAt]);

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: '55552222-5555-2222-5555-222255552222',
          seatIds: ['88889999-8888-9999-8888-999988889991'], // Note: requires seat to be held first, but for demo we can just let it fail or mock it
          userId: '33333333-3333-3333-3333-333333333333',
          bookingRef: `GS-${Math.random().toString(36).substring(7).toUpperCase()}`,
          userEmail: 'customer1@example.com'
        })
      });
      const data = await res.json();
      if (data.mockHtml) {
        window.dispatchEvent(new CustomEvent('grabscene:mock-email', { detail: { mockHtml: data.mockHtml } }));
      }
      setTimeout(() => {
        alert("Ticket Claimed Successfully! See the generated email in the preview drawer.");
      }, 500);
    } catch (e) {
      alert("Error processing claim.");
    }
    setIsProcessing(false);
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Validating your exclusive offer...</p>
        </div>
      </div>
    );
  }

  if (!offerData || isExpired) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
        <div className="bg-[#0c111d] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Offer Expired</h2>
          <p className="text-zinc-400 mb-8">
            This waitlist offer has expired or the token is invalid. The seat has been offered to the next person in line.
          </p>
          <button onClick={() => router.push('/shows/123')} className="w-full py-3.5 rounded-xl font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
            View Show Availability
          </button>
        </div>
      </div>
    );
  }

  // Timer formatting
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isLowTime = remainingMs > 0 && remainingMs <= 2 * 60 * 1000;
  const progressPercent = Math.max(0, (remainingMs / (10 * 60 * 1000)) * 100);

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-12 mt-8 text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-4 h-4" /> Waitlist Offer
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">You're up!</h1>
          <p className="text-zinc-400 text-lg max-w-lg">
            A {offerData.seat.category} seat just became available. Claim your ticket before the timer runs out.
          </p>
        </div>

        <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {/* Urgent Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
              <div>
                <h3 className="text-amber-500 font-bold">Action Required</h3>
                <p className="text-amber-500/80 text-sm">This seat will be passed to the next person soon.</p>
              </div>
            </div>
            <HoldCountdownTimer 
              formattedTime={formattedTime}
              isLowTime={isLowTime}
              isExpired={isExpired}
              progressPercent={progressPercent}
            />
          </div>

          <div className="p-8 md:p-10">
            <h2 className="text-xl font-semibold text-white mb-6">Seat Details</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center mb-10">
              <div>
                <p className="text-2xl font-bold text-white mb-1">Row {offerData.seat.row} - Seat {offerData.seat.number}</p>
                <div className="inline-flex items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                  {offerData.seat.category}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500 mb-1">Total Price</p>
                <p className="text-3xl font-bold text-emerald-400">${offerData.seat.price.toFixed(2)}</p>
              </div>
            </div>

            <button 
              onClick={handleClaim}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-300
                bg-white hover:bg-zinc-200 text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isProcessing ? "Confirming..." : "Claim Ticket Now"}
            </button>
            <p className="text-center text-zinc-500 text-sm mt-6">
              If you don't want this seat, you can just ignore this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050810] flex items-center justify-center text-zinc-400">Loading...</div>}>
      <ClaimPageContent />
    </Suspense>
  );
}
