"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HoldCountdownTimer } from '../../../components/booking/HoldCountdownTimer';
import { BrandLogo } from '../../../components/BrandLogo';
import { useHoldTimer } from '../../../hooks/useHoldTimer';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Clock, CreditCard, LockKeyhole, Smartphone, Wallet } from 'lucide-react';

export default function CheckoutPage() {
   
  const params = useParams();
  const router = useRouter();
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Dynamic state for selected seats loaded from sessionStorage
  const [selectedSeats, setSelectedSeats] = useState<{id: string; row: string; seatNumber: string; category: string; price: number}[]>([]);
  const [userId, setUserId] = useState('demo-user');
  
  useEffect(() => {
    try {
      const data = sessionStorage.getItem('grabscene_pending_seats');
       
      if (data) setSelectedSeats(JSON.parse(data));
      const eventData = sessionStorage.getItem('grabscene_pending_event');
       
      if (eventData) setSelectedEvent(JSON.parse(eventData));
      const pendingUser = sessionStorage.getItem('grabscene_pending_user');
       
      if (pendingUser) setUserId(pendingUser);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Compute total dynamically
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = selectedSeats.length * 2.50; // $2.50 per ticket fee
  const total = subtotal + serviceFee;
  
  // Extract real IDs
  const seatIds = useMemo(() => {
    if (selectedSeats.length > 0) return selectedSeats.map(s => s.id);
    return ["55555555-5555-5555-5555-000000000001"]; // fallback
  }, [selectedSeats]);
  
  // Calculate a mock expiry 10 minutes from now (simulating what the server returned)
  const [expiresAtIso] = useState(() => new Date(Date.now() + 10 * 60 * 1000).toISOString());
  
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('customer1@example.com');

  const handleExpire = useCallback(() => {
    setIsExpiredModalOpen(true);
  }, []);

  const { remainingMs, formattedTime, isExpired, isLowTime, releaseManually } = useHoldTimer({
    expiresAtIso,
    showId: selectedEvent?.id || 'default',
    seatIds,
    userId,
    onExpire: handleExpire
  });

  const totalDuration = 10 * 60 * 1000;
  const progressPercent = useMemo(() => Math.max(0, (remainingMs / totalDuration) * 100), [remainingMs, totalDuration]);

  const handleCancel = () => {
    releaseManually();
    if (selectedEvent) {
      router.push(`/shows/${selectedEvent.id}`);
    } else {
      router.push('/');
    }
  };

  const handlePay = async () => {
    if (!email.includes('@')) {
      setErrorMsg('Enter a valid email address for your ticket delivery.');
      return;
    }
    if (paymentMethod === 'card' && (cardName.trim().length < 2 || cardNumber.replace(/\D/g, '').length < 12 || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length < 3)) {
      setErrorMsg('Complete the card details to continue. Use any demo values; no payment is processed.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: selectedEvent?.id || 'default',
          seatIds: seatIds,
          userId: userId,
          userEmail: email
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // Dispatch event to show the Email Drawer Intercept
      if (data.mockHtml) {
        window.dispatchEvent(new CustomEvent('grabscene:mock-email', { detail: { mockHtml: data.mockHtml } }));
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`grabscene:booking:${selectedEvent.id}`, JSON.stringify({ seatIds, bookingRef: data.bookingId, bookedAt: Date.now() }));
        window.localStorage.removeItem(`grabscene:hold:${selectedEvent.id}`);
      }
      
      // Wait 3 seconds to let them see the email drawer, then redirect to digital pass
      // Note: We now expect the server to return the generated bookingRef (data.bookingId in the MOCK branch for now, or actual bookingId)
      // Actually, wait, the API was updated to return bookingId in mock, we should redirect to that. 
      // Let's assume data.bookingId is the bookingRef for now, as that's what the API returns in mock mode.
      setTimeout(() => {
        router.push(`/tickets/${data.bookingId || data.bookingRef || 'MOCK-REF'}`);
      }, 3000);
     
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bms-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      
      {/* Top Navigation & Timer */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <BrandLogo compact />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>
          <p className="text-slate-500">{selectedEvent.title} at {selectedEvent.venue}, {selectedEvent.city}</p>
        </div>
        
        <div className="sticky top-4 z-40" role="timer" aria-live="polite" aria-label={`Time remaining: ${formattedTime}`}>
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
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="relative h-40 overflow-hidden rounded-2xl border border-white/10 mb-8">
            <Image src={selectedEvent.image} alt={`${selectedEvent.title} event artwork`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 640px" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bms-red">Your reservation</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{selectedEvent.title}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-6">Customer Details</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="checkout-first-name" className="text-sm text-slate-500">First Name</label>
                <input id="checkout-first-name" disabled={isExpired} type="text" autoComplete="given-name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label htmlFor="checkout-last-name" className="text-sm text-slate-500">Last Name</label>
                <input id="checkout-last-name" disabled={isExpired} type="text" autoComplete="family-name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="checkout-email" className="text-sm text-slate-500">Email Address</label>
              <input id="checkout-email" disabled={isExpired} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="jane@example.com" />
            </div>
            
            <hr className="border-slate-200 my-8" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Payment Information</h2>
                <p className="mt-1 text-xs text-slate-500">Demo checkout. No real payment will be charged.</p>
              </div>
              <LockKeyhole className="h-5 w-5 text-emerald-400" aria-label="Secure demo checkout" />
            </div>

            <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Payment method">
              {[
                { id: 'card' as const, label: 'Card', icon: CreditCard },
                { id: 'upi' as const, label: 'UPI', icon: Smartphone },
                { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" role="tab" aria-selected={paymentMethod === id} onClick={() => setPaymentMethod(id)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${paymentMethod === id ? 'border-cyan-400 bg-bms-red-hover/10 text-bms-red' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-zinc-700 hover:text-slate-900'}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>

            {paymentMethod === 'card' ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="checkout-card-name" className="text-sm text-slate-500">Name on card</label>
                  <input id="checkout-card-name" value={cardName} onChange={(event) => setCardName(event.target.value)} disabled={isExpired} autoComplete="cc-name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="checkout-card-number" className="text-sm text-slate-500">Card number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" aria-hidden="true" />
                    <input id="checkout-card-number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))} disabled={isExpired} inputMode="numeric" autoComplete="cc-number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-slate-900 tracking-widest focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="4242 4242 4242 4242" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="checkout-expiry" className="text-sm text-slate-500">Expiry</label>
                    <input id="checkout-expiry" value={expiry} onChange={(event) => setExpiry(event.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/'))} disabled={isExpired} inputMode="numeric" autoComplete="cc-exp" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="08/29" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="checkout-cvv" className="text-sm text-slate-500">CVV</label>
                    <input id="checkout-cvv" value={cvv} onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))} disabled={isExpired} inputMode="numeric" autoComplete="cc-csc" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red disabled:opacity-50" placeholder="123" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 bg-slate-50/60 p-6 text-center">
                <p className="font-medium text-slate-900">{paymentMethod === 'upi' ? 'UPI demo selected' : 'Wallet demo selected'}</p>
                <p className="mt-2 text-sm text-slate-500">You will see a simulated authorization step after continuing.</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500"><Check className="h-4 w-4 text-emerald-400" /> Your ticket will be delivered to {email || 'your email address'}.</div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6" aria-live="polite">
              {selectedSeats.length > 0 ? (
                selectedSeats.map(seat => (
                  <div key={seat.id} className="flex justify-between text-slate-700">
                    <span>Row {seat.row} - Seat {seat.seatNumber} ({seat.category})</span>
                    <span>${seat.price.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic">No seats selected (Mock Mode)</div>
              )}
              
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end mb-8">
                <span className="text-slate-500">Total</span>
                <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm" role="alert">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  type="button"
                  onClick={handlePay}
                  disabled={isExpired || isProcessing || selectedSeats.length === 0}
                  className="w-full py-4 rounded-xl font-medium flex justify-center items-center gap-2 transition-all 
                    disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed
                    bg-bms-red hover:bg-bms-red-hover text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  aria-busy={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </button>
                <button 
                  type="button"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="expired-title">
          <div className="bg-white border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 id="expired-title" className="text-2xl font-bold text-slate-900 mb-2">Hold Expired</h2>
            <p className="text-slate-500 mb-8">
              The time limit for your reservation has expired. The seats have been released back to the public pool.
            </p>
            <button 
              type="button"
              onClick={() => router.push(`/shows/${selectedEvent.id}`)}
              className="w-full py-3.5 rounded-xl font-medium bg-slate-200 hover:bg-slate-300 text-slate-900 transition-colors"
            >
              Return to Seat Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

