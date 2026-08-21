"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { HoldCountdownTimer } from '../../../components/booking/HoldCountdownTimer';
import { useHoldTimer } from '../../../hooks/useHoldTimer';
import { useParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  
  // In a real app, you would fetch these details based on the holdId from an API.
  // For demonstration, we simulate the state.
  const showId = "mock-show-id";
  const seatIds = ["A-1", "A-2"];
  const userId = "user-123";
  
  // Calculate a mock expiry 10 minutes from now (simulating what the server returned)
  const [expiresAtIso] = useState(() => new Date(Date.now() + 10 * 60 * 1000).toISOString());
  
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExpire = useCallback(() => {
    setIsExpiredModalOpen(true);
  }, []);

  const { remainingMs, formattedTime, isExpired, isLowTime, releaseManually } = useHoldTimer({
    expiresAtIso,
    showId,
    seatIds,
    userId,
    onExpire: handleExpire
  });

  const totalDuration = 10 * 60 * 1000;
  const progressPercent = useMemo(() => Math.max(0, (remainingMs / totalDuration) * 100), [remainingMs]);

  const handleCancel = () => {
    releaseManually();
    router.push('/shows/123'); // Go back to show map
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const bRef = `GS-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: showId,
          seatIds: seatIds,
          userId: userId,
          bookingRef: bRef,
          userEmail: 'customer1@example.com'
        })
      });
      const data = await res.json();
      
      // Dispatch event to show the Email Drawer Intercept
      if (data.mockHtml) {
        window.dispatchEvent(new CustomEvent('grabscene:mock-email', { detail: { mockHtml: data.mockHtml } }));
      }
      
      // Wait 3 seconds to let them see the email drawer, then redirect to digital pass
      setTimeout(() => {
        router.push(`/tickets/${bRef}`);
      }, 3000);
    } catch (e) {
      alert("Payment failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-4 md:p-8 font-sans">
      
      {/* Top Navigation & Timer */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Checkout</h1>
          <p className="text-zinc-400">Complete your reservation before the timer runs out.</p>
        </div>
        
        <div className="sticky top-4 z-40">
          <HoldCountdownTimer 
            formattedTime={formattedTime}
            isLowTime={isLowTime}
            isExpired={isExpired}
            progressPercent={progressPercent}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Form Column */}
        <div className="flex-1 bg-[#0c111d] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Customer Details</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">First Name</label>
                <input disabled={isExpired} type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50" placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Last Name</label>
                <input disabled={isExpired} type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Email Address</label>
              <input disabled={isExpired} type="email" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50" placeholder="jane@example.com" />
            </div>
            
            <hr className="border-zinc-800 my-8" />
            
            <h2 className="text-xl font-semibold text-white mb-6">Payment Information</h2>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Card Details (Simulated)</label>
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 flex items-center justify-between">
                <span>•••• •••• •••• 4242</span>
                <span className="text-xs border border-zinc-700 px-2 py-1 rounded">Mock Stripe Element</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-300">
                <span>Row A - Seat 1 (Standard)</span>
                <span>$45.00</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Row A - Seat 2 (Standard)</span>
                <span>$45.00</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Service Fee</span>
                <span>$5.00</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-zinc-800">
              <div className="flex justify-between items-end mb-8">
                <span className="text-zinc-400">Total</span>
                <span className="text-3xl font-bold text-white">$95.00</span>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePay}
                  disabled={isExpired || isProcessing}
                  className="w-full py-4 rounded-xl font-medium flex justify-center items-center gap-2 transition-all 
                    disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed
                    bg-cyan-500 hover:bg-cyan-400 text-cyan-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  {isProcessing ? "Processing..." : "Pay $95.00"}
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl font-medium flex justify-center items-center gap-2 transition-all 
                    text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Cancel & Release Seats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Modal Overlay */}
      {isExpiredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0c111d] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Hold Expired</h2>
            <p className="text-zinc-400 mb-8">
              The time limit for your reservation has expired. The seats have been released back to the public pool.
            </p>
            <button 
              onClick={() => router.push('/shows/123')}
              className="w-full py-3.5 rounded-xl font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              Return to Seat Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
