"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { ShowSeat } from "../../types/booking";
import { MonitorPlay, Sparkles } from "lucide-react";

interface Props {
  seats: ShowSeat[];
  selectedSeatIds: string[];
  onSeatClick: (seatId: string) => void;
  layout?: 'concert' | 'arena' | 'theater';
  isLoading?: boolean;
}

export function SeatMap({ seats, selectedSeatIds, onSeatClick, layout = 'theater', isLoading = false }: Props) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const newScale = width < 800 ? width / 800 : 1;
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sectionGrid = useMemo(() => {
    const sections = new Map<string, Map<string, ShowSeat[]>>();
    
    seats.forEach((seat) => {
      const sectionName = seat.section || seat.category || 'General';
      if (!sections.has(sectionName)) {
        sections.set(sectionName, new Map());
      }
      const rowMap = sections.get(sectionName)!;
      if (!rowMap.has(seat.row)) rowMap.set(seat.row, []);
      rowMap.get(seat.row)!.push(seat);
    });

    const result: { sectionName: string; rows: [string, ShowSeat[]][] }[] = [];
    
    for (const [sectionName, rowMap] of sections.entries()) {
      for (const [row, rowSeats] of rowMap.entries()) {
        rowSeats.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
      }
      result.push({
        sectionName,
        rows: Array.from(rowMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      });
    }

    // Sort sections: VIP/Premium first, then standard
    result.sort((a, b) => {
      const aLower = a.sectionName.toLowerCase();
      const bLower = b.sectionName.toLowerCase();
      if (aLower.includes('vip') || aLower.includes('premium')) return -1;
      if (bLower.includes('vip') || bLower.includes('premium')) return 1;
      return aLower.localeCompare(bLower);
    });
    return result;
  }, [seats]);

  const getSeatColor = (status: ShowSeat["status"], isVip: boolean) => {
    switch (status) {
      case "available":
        return isVip 
          ? "bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/40 hover:border-amber-400"
          : "bg-zinc-800 border-zinc-600 hover:bg-cyan-500/30 hover:border-cyan-400";
      case "held":
        return "bg-amber-500 border-amber-400 animate-pulse cursor-not-allowed";
      case "booked":
        return "bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed";
      default:
        return "bg-zinc-800 border-zinc-700";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-[#050810] rounded-3xl border border-zinc-800">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#050810] rounded-3xl border border-zinc-800/50 overflow-hidden relative shadow-2xl">
      
      {/* Screen / Stage based on layout */}
      {layout !== 'arena' && (
        <div className="w-full pt-12 pb-16 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 w-full h-full bg-gradient-to-b from-cyan-500/10 to-transparent opacity-50"></div>
          {layout === 'theater' ? (
            <div className="w-[80%] h-32 absolute -top-16 rounded-[100%] border-b-[8px] border-cyan-500 shadow-[0_20px_60px_rgba(34,211,238,0.4)] bg-black z-10"></div>
          ) : (
            <div className="w-[80%] h-8 absolute top-0 border-b-[4px] border-cyan-500 shadow-[0_10px_40px_rgba(34,211,238,0.4)] bg-black z-10"></div>
          )}
          <div className="relative z-20 flex flex-col items-center mt-4 text-cyan-400/80">
            <MonitorPlay className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">{layout === 'concert' ? 'Main Stage' : 'Stage / Screen'}</span>
          </div>
        </div>
      )}

      {/* Seat Grid */}
      <div ref={containerRef} className="w-full overflow-x-auto pb-24 px-4 scrollbar-hide">
        <div 
          className={`mx-auto flex flex-col items-center min-w-[max-content] pb-10 ${layout === 'arena' ? 'pt-16' : ''}`}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          
          {layout === 'arena' && (
            <div className="w-64 h-32 bg-zinc-900 border border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-zinc-500 font-bold tracking-widest uppercase mb-16 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <Sparkles className="w-5 h-5 mb-2 text-zinc-600" />
              Center Stage
            </div>
          )}

          <div className={layout === 'arena' ? 'flex flex-wrap justify-center gap-20 max-w-4xl' : 'flex flex-col gap-12'}>
            {sectionGrid.map(({ sectionName, rows }) => (
              <div key={sectionName} className="flex flex-col items-center bg-zinc-950/30 p-6 rounded-3xl border border-zinc-800/30">
                <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6 px-6 py-2 border border-zinc-800 rounded-full bg-zinc-900/80 shadow-lg flex items-center gap-2">
                  {(sectionName.toLowerCase().includes('vip') || sectionName.toLowerCase().includes('premium')) && <Sparkles className="w-3 h-3 text-amber-500" />}
                  {sectionName}
                </h3>
                <div className="flex flex-col gap-3">
                  {rows.map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-6 justify-center group">
                      <div className="w-8 text-center text-sm font-bold text-zinc-600 group-hover:text-cyan-500 transition-colors">
                        {row}
                      </div>

                      <div className="flex gap-4">
                        {rowSeats.length > 10 ? (
                          <>
                            <div className="flex gap-1.5">
                              {rowSeats.slice(0, Math.floor(rowSeats.length / 3)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                            <div className="flex gap-1.5 px-4 border-x border-zinc-800/50">
                              {rowSeats.slice(Math.floor(rowSeats.length / 3), Math.floor(rowSeats.length * 2 / 3)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                            <div className="flex gap-1.5">
                              {rowSeats.slice(Math.floor(rowSeats.length * 2 / 3)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex gap-1.5">
                            {rowSeats.map((seat) => (
                              <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-8 text-center text-sm font-bold text-zinc-600 group-hover:text-cyan-500 transition-colors">
                        {row}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Legend */}
      <div className="absolute bottom-0 left-0 w-full bg-[#0c111d]/90 backdrop-blur-xl border-t border-zinc-800/50 p-4 flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-600 shadow-inner"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 text-amber-400">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-inner">
            <Sparkles className="w-3 h-3" />
          </div>
          <span>VIP / Premium</span>
        </div>
        <div className="flex items-center gap-2 text-amber-500">
          <div className="w-5 h-5 rounded-md bg-amber-500 border border-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <span>Held by Others</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 opacity-50 relative overflow-hidden">
            <div className="absolute inset-0 border-t-2 border-red-500/20 rotate-45 scale-150 transform origin-center"></div>
          </div>
          <span>Sold Out</span>
        </div>
      </div>
    </div>
  );
}

function SeatButton({ seat, onSelect, getColor, isSelected }: { seat: ShowSeat, onSelect: (id: string) => void, getColor: any, isSelected: boolean }) {
  const isVip = seat.category === "VIP" || seat.category === "Premium";
  const colorClass = getColor(seat.status, isVip);
  const isDisabled = seat.status === "booked" || seat.status === "held";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(seat.id)}
      className={`
        relative w-7 h-8 rounded-t-lg rounded-b-sm border-t-2 border-x-2 border-b-4 
        transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg
        flex flex-col items-center justify-start pt-1 group
        ${isSelected ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110 z-10' : colorClass}
        ${!isDisabled && isVip && !isSelected ? 'shadow-[0_0_10px_rgba(245,158,11,0.1)]' : ''}
      `}
      title={`${seat.section || seat.category} - Row ${seat.row} Seat ${seat.seatNumber} - $${seat.price}`}
      aria-label={`${seat.category} seat ${seat.row}${seat.seatNumber} - ${seat.status}`}
    >
      <span className="text-[9px] font-bold text-white/50 group-hover:text-white transition-colors">{seat.seatNumber}</span>
      
      {/* Armrests simulation */}
      <div className="absolute top-2 -left-[1px] w-[2px] h-3 bg-black/20 rounded-full"></div>
      <div className="absolute top-2 -right-[1px] w-[2px] h-3 bg-black/20 rounded-full"></div>
      
      {/* VIP Star */}
      {isVip && !isDisabled && (
        <Sparkles className="absolute -top-2 w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
