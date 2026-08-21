"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { BrandLogo } from '@/components/BrandLogo';
import { getEvent } from '@/lib/events';

interface BookingData {
  id: string;
  booking_ref: string;
  total_amount: number;
  status: string;
  event_title: string;
  venue_name: string;
  show_date: string;
  show_time: string;
  seats: { row: string; number: string; category: string; price: number }[];
  qr_code_url: string | null;
}

export default function TicketPassPage() {
  const params = useParams();
  const reference = params.reference as string;
  const ticketRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(() => getEvent("55551111-5555-1111-5555-111155551111"));
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Try to load real booking data from API
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${reference}`);
        if (res.ok) {
          const data = await res.json();
          if (data.booking) {
            setBooking(data.booking);
            setIsLoadingBooking(false);
            return;
          }
        }
      } catch {
        // API failed, fall through to session storage
      }

      // Fallback: try session storage for demo/mock mode
      try {
        const eventData = sessionStorage.getItem('grabscene_pending_event');
        if (eventData) setSelectedEvent(JSON.parse(eventData));

        const seatsData = sessionStorage.getItem('grabscene_pending_seats');
        const seats = seatsData ? JSON.parse(seatsData) : [];

        setBooking({
          id: 'session-mock',
          booking_ref: reference,
          total_amount: seats.reduce((sum: number, s: any) => sum + (s.price || 0), 0),
          status: 'confirmed',
          event_title: selectedEvent.title,
          venue_name: `${selectedEvent.venue}, ${selectedEvent.city}`,
          show_date: selectedEvent.date,
          show_time: selectedEvent.time,
          seats: seats.map((s: any) => ({
            row: s.row || '?',
            number: s.seatNumber || '?',
            category: s.category || 'Standard',
            price: s.price || 0,
          })),
          qr_code_url: null,
        });
      } catch {
        // Last resort fallback
        setBooking({
          id: 'fallback',
          booking_ref: reference,
          total_amount: 0,
          status: 'confirmed',
          event_title: selectedEvent.title,
          venue_name: `${selectedEvent.venue}, ${selectedEvent.city}`,
          show_date: selectedEvent.date,
          show_time: selectedEvent.time,
          seats: [],
          qr_code_url: null,
        });
      }
      setIsLoadingBooking(false);
    };

    fetchBooking();
  }, [reference]);

  useEffect(() => {
    // Generate QR code
    const eventId = booking?.id || selectedEvent.id;
    QRCode.toDataURL(JSON.stringify({ ref: reference, event: eventId }), {
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      width: 256
    }).then(setQrCodeUrl).catch(console.error);
  }, [reference, booking, selectedEvent.id]);

  const handleDownload = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#090D16', scale: 2 });
      const link = document.createElement('a');
      link.download = `GrabScene-Ticket-${reference}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("Failed to generate ticket image", e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const displayTitle = booking?.event_title || selectedEvent.title;
  const displayVenue = booking?.venue_name || `${selectedEvent.venue}, ${selectedEvent.city}`;
  const displayDate = booking?.show_date || selectedEvent.date;
  const displayTime = booking?.show_time || selectedEvent.time;
  const displaySeats = booking?.seats || [];
  const firstSeat = displaySeats[0];
  const seatLabel = displaySeats.length > 1
    ? `${displaySeats.length} seats`
    : firstSeat
      ? `Row ${firstSeat.row}, Seat ${firstSeat.number}`
      : 'General Admission';

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-4 font-sans text-zinc-100">
      <style>{`
        @keyframes scan {
          0% { top: 5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 95%; opacity: 0; }
        }
      `}</style>

      {/* Controls */}
      <div className="w-full max-w-sm flex justify-between items-center mb-6 px-2">
        <div>
          <BrandLogo compact />
          <h1 className="text-xl font-bold text-white tracking-tight">Your Digital Pass</h1>
        </div>
        <div className="flex gap-2">
          <button 
          type="button"
          onClick={handleDownload} 
          disabled={isDownloading}
          className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center transition-colors disabled:opacity-50"
          aria-label="Download ticket as image"
        >
          <Download className="w-4 h-4 text-zinc-300" aria-hidden="true" />
        </button>
        <button type="button" className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center transition-colors" aria-label="Share ticket">
          <Share2 className="w-4 h-4 text-zinc-300" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Ticket Card */}
      <div ref={ticketRef} className="w-full max-w-sm relative">
        
        {/* Top Half */}
        <div className="bg-[#0c111d] border border-zinc-800 rounded-t-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none" aria-hidden="true" />
          <div className="relative h-32 overflow-hidden rounded-2xl border border-white/10 mb-6">
            <Image src={selectedEvent.image} alt={`${displayTitle} event artwork`} fill className="object-cover" sizes="384px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-1">
                {firstSeat?.category || 'General Admission'}
              </p>
              <h2 className="text-2xl font-bold text-white leading-tight">{displayTitle}</h2>
              <p className="text-zinc-400 text-sm mt-1">{displayVenue}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Date</p>
              <p className="text-sm font-semibold text-zinc-200">{displayDate}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Time</p>
              <p className="text-sm font-semibold text-zinc-200">{displayTime}</p>
            </div>
            {displaySeats.length <= 2 ? (
              displaySeats.map((seat, idx) => (
                <React.Fragment key={idx}>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Row</p>
                    <p className="text-sm font-semibold text-zinc-200">{seat.row}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Seat</p>
                    <p className="text-sm font-semibold text-zinc-200">{seat.number}</p>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Seats</p>
                  <p className="text-sm font-semibold text-zinc-200">{seatLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    ${booking?.total_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider Cutout */}
        <div className="flex items-center w-full bg-transparent relative -my-[1px]">
          <div className="w-4 h-8 bg-[#050810] border-r border-zinc-800 rounded-r-full absolute left-[-1px] z-20"></div>
          <div className="flex-1 border-t-2 border-dashed border-zinc-800"></div>
          <div className="w-4 h-8 bg-[#050810] border-l border-zinc-800 rounded-l-full absolute right-[-1px] z-20"></div>
        </div>

        {/* Bottom Half (QR Code) */}
        <div className="bg-[#0c111d] border border-zinc-800 rounded-b-3xl p-8 flex flex-col items-center relative overflow-hidden">
          <p className="text-xs text-zinc-500 mb-6 uppercase tracking-widest">Scan at Entrance</p>
          
          <div className="relative bg-white p-3 rounded-2xl w-48 h-48 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Ticket QR Code" className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-zinc-100 animate-pulse rounded-xl"></div>
            )}
            
            {/* Animated Scan Line */}
            <div className="absolute left-0 w-full h-[3px] bg-cyan-400 shadow-[0_0_12px_#22d3ee] rounded-full opacity-80" style={{ animation: 'scan 2.5s ease-in-out infinite' }} />
          </div>

          <p className="text-xs text-zinc-500">Booking Reference</p>
          <p className="text-lg font-mono font-bold text-white tracking-widest mt-1">{reference}</p>
        </div>
      </div>
      
    </div>
  );
}
