"use client";

import React from "react";
import { ShowSeat } from "../../types/booking";
import { Loader2 } from "lucide-react";

interface Props {
  selectedSeats: ShowSeat[];
  onProceed: () => void;
  isLoading: boolean;
}

export const BookingSummarySidebar = ({ selectedSeats, onProceed, isLoading }: Props) => {
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="w-full lg:w-80 bg-[#0c111d] border border-zinc-800 rounded-2xl p-6 flex flex-col h-full text-zinc-100 shadow-2xl">
      <h2 className="text-xl font-bold mb-6 tracking-tight text-white">Booking Summary</h2>
      
      <div className="flex-1 overflow-y-auto mb-6 pr-2">
        {selectedSeats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <p>No seats selected</p>
            <p className="text-xs mt-1 text-center">Select seats from the map to begin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedSeats.map(seat => (
              <div key={seat.id} className="flex justify-between items-center p-3 bg-zinc-900/80 rounded-lg border border-zinc-800/50">
                <div>
                  <div className="font-medium text-zinc-200">Row {seat.row} - Seat {seat.seatNumber}</div>
                  <div className="text-xs text-zinc-500">{seat.category}</div>
                </div>
                <div className="font-semibold text-emerald-400">${seat.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-800 space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-zinc-400">Total</span>
          <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={onProceed}
          disabled={selectedSeats.length === 0 || isLoading}
          className="w-full py-3.5 px-4 rounded-xl font-medium flex justify-center items-center gap-2 transition-all duration-200 
            disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed
            bg-emerald-500 hover:bg-emerald-400 text-emerald-950 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Proceed to Hold</>
          )}
        </button>
      </div>
    </div>
  );
};
