"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Ticket,
  Calendar,
  MapPin,
  XCircle,
  ExternalLink,
  Loader2,
  ChevronRight,
  Inbox,
  ArrowLeft,
} from "lucide-react";

interface BookingSeat {
  row: string;
  number: string;
  category: string;
  price: number;
}

interface Booking {
  id: string;
  booking_ref: string;
  total_amount: number;
  status: string;
  created_at: string;
  event_title: string;
  venue_name: string;
  show_date: string | null;
  seats: BookingSeat[];
}

export default function BookingHistoryPage() {
   
  const { user, isLoading: authLoading } = useAuth();
   
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fallback demo user for mock mode
  const userId = user?.id || "33333333-3333-3333-3333-333333333333";

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/history?userId=${userId}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
     
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);



  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, userId }),
      });

      if (res.ok) {
        setToast({ message: "Booking cancelled. Seats released back to pool.", type: "success" });
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
        );
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Failed to cancel booking.", type: "error" });
      }
    } catch {
      setToast({ message: "An unexpected error occurred.", type: "error" });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`mb-10 ${mounted ? 'animate-fadeInDown' : 'opacity-0'}`}>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors duration-300 btn-press">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <BrandLogo compact />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-2">My Bookings</h1>
          <p className="text-zinc-400 mt-1">View your booking history and manage reservations.</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-bms-red animate-spin mb-4" />
            <p className="text-zinc-500">Loading your bookings...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && bookings.length === 0 && (
          <div className="text-center py-20 animate-fadeInUp">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Inbox className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No bookings yet</h2>
            <p className="text-zinc-500 mb-8">Start by browsing events and booking your first seats.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-bms-red hover:bg-bms-red-hover text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] btn-press btn-shimmer"
            >
              Browse Events
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking, idx) => {
              const isCancelled = booking.status === "cancelled";
              const isConfirmed = booking.status === "confirmed";

              return (
                <div
                  key={booking.id}
                  className={`glass-dark rounded-2xl overflow-hidden shadow-xl transition-all duration-500 animate-fadeInUp ${
                    isCancelled
                      ? "opacity-60"
                      : "hover:border-zinc-700 hover:shadow-2xl"
                  }`}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white tracking-tight truncate">
                            {booking.event_title}
                          </h3>
                          <span
                            className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ${
                              isConfirmed
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-red-500/10 border border-red-500/30 text-red-400"
                            } ${isConfirmed ? 'animate-pulse' : ''}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.venue_name}
                          </span>
                          {booking.show_date && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.show_date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5" />
                            {booking.booking_ref}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Total</p>
                          <p className="text-xl font-bold text-white">${booking.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {booking.seats.map((seat, seatIdx) => (
                        <div
                          key={seatIdx}
                          className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm transition-all duration-300 hover:border-zinc-700"
                        >
                          <span className="font-medium text-zinc-200">
                            Row {seat.row} - Seat {seat.number}
                          </span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-zinc-400">{seat.category}</span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-emerald-400 font-medium">${seat.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                      {isConfirmed && (
                        <>
                          <Link
                            href={`/tickets/${booking.booking_ref}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bms-red/10 border border-bms-red/30 text-bms-red hover:bg-bms-red/20 text-sm font-medium transition-all duration-300 hover:scale-[1.02] btn-press"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Ticket
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-300 disabled:opacity-50 btn-press"
                          >
                            {cancellingId === booking.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Cancel Booking
                          </button>
                        </>
                      )}
                      {isCancelled && (
                        <span className="text-sm text-zinc-600 italic">
                          This booking has been cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toast */}
        <div
          className={`fixed bottom-8 left-1/2 z-50 ${
            toast ? "animate-toastIn" : "translate-y-8 opacity-0 pointer-events-none transition-all duration-300"
          }`}
        >
          {toast && (
            <div
              className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-medium whitespace-nowrap ${
                toast.type === "error"
                  ? "bg-red-500/10 border-red-500/50 text-red-200"
                  : "bg-emerald-500/10 border-emerald-500/50 text-emerald-200"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${
                  toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
