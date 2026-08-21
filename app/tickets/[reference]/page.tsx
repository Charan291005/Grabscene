"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { BrandLogo } from '../../../components/BrandLogo';
import { getEvent } from '../../../lib/events';

export default function TicketPassPage() {
  const params = useParams();
  const reference = params.reference as string;
  const ticketRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState(() => getEvent("55551111-5555-1111-5555-111155551111"));
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Generate a demo QR code dynamically for the ticket viewer
    // In production, we could just pass down the pre-generated one from the DB
    const eventData = sessionStorage.getItem('grabscene_pending_event');
    if (eventData) setSelectedEvent(JSON.parse(eventData));
    QRCode.toDataURL(JSON.stringify({ ref: reference, event: selectedEvent.id }), {
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      width: 256
    }).then(setQrCodeUrl).catch(console.error);
  }, [reference, selectedEvent.id]);

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
            <Image src={selectedEvent.image} alt={`${selectedEvent.title} event artwork`} fill className="object-cover" sizes="384px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-1">General Admission</p>
              <h2 className="text-2xl font-bold text-white leading-tight">{selectedEvent.title}</h2>
              <p className="text-zinc-400 text-sm mt-1">{selectedEvent.venue}, {selectedEvent.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Date</p>
              <p className="text-sm font-semibold text-zinc-200">{selectedEvent.date}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Time</p>
              <p className="text-sm font-semibold text-zinc-200">{selectedEvent.time}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Row</p>
              <p className="text-sm font-semibold text-zinc-200">A</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Seat</p>
              <p className="text-sm font-semibold text-zinc-200">12</p>
            </div>
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
