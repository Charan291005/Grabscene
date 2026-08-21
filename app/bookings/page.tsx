"use client";

import React, { useState, useEffect } from "react";
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

  // Fallback demo user for mock mode
  const userId = user?.id || "33333333-3333-3333-3333-333333333333";

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchBookings = async () => {
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
  };

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
        <div className="mb-10">
          <BrandLogo compact />
          <h1 className="text-3xl font-bold text-white tracking-tight mt-2">My Bookings</h1>
          <p className="text-zinc-400 mt-1">View your booking history and manage reservations.</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
            <p className="text-zinc-500">Loading your bookings...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No bookings yet</h2>
            <p className="text-zinc-500 mb-8">Start by browsing events and booking your first seats.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold rounded-xl transition-colors"
            >
              Browse Events
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isCancelled = booking.status === "cancelled";
              const isConfirmed = booking.status === "confirmed";

              return (
                <div
                  key={booking.id}
                  className={`bg-[#0c111d] border rounded-2xl overflow-hidden shadow-xl transition-all ${
                    isCancelled
                      ? "border-zinc-800/50 opacity-60"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white tracking-tight truncate">
                            {booking.event_title}
                          </h3>
                          <span
                            className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isConfirmed
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-red-500/10 border border-red-500/30 text-red-400"
                            }`}
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
                      {booking.seats.map((seat, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm"
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Ticket
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-50"
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
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-50 ${
            toast ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
          }`}
        >
          {toast && (
            <div
              className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-medium ${
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
