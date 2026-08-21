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

  const getSeatColor = (status: ShowSeat["status"], category: string) => {
    if (status === "held") {
      return "bg-zinc-500 border-zinc-400 animate-pulse cursor-not-allowed";
    }
    if (status === "booked") {
      return "bg-zinc-800 border-zinc-900 opacity-40 cursor-not-allowed";
    }
    
    // Available colors by category
    if (category === "VIP") {
      return "bg-amber-400 border-amber-500 hover:bg-amber-300 hover:border-amber-400 text-amber-950";
    } else if (category === "Premium") {
      return "bg-purple-500 border-purple-600 hover:bg-purple-400 hover:border-purple-500 text-white";
    } else {
      // Standard
      return "bg-cyan-500 border-cyan-600 hover:bg-cyan-400 hover:border-cyan-500 text-cyan-950";
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
          <div className={`
            ${layout === 'arena' ? 'relative w-[800px] h-[800px] flex items-center justify-center' : 
              layout === 'concert' ? 'flex flex-col items-center gap-8' : 
              layout === 'theater' ? 'flex flex-col items-center gap-10 perspective-[1000px]' :
              'flex flex-col items-center gap-16'} 
          `}>
            {/* Stage */}
            <div className={`
              ${layout === 'arena' ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32' : 'w-64 h-24 mb-12'}
              bg-zinc-900/80 border border-zinc-700/50 rounded-3xl flex flex-col items-center justify-center
              shadow-[0_0_50px_rgba(34,211,238,0.1)] backdrop-blur-xl z-0
            `}>
              <Sparkles className="w-5 h-5 text-cyan-500/50 mb-2" />
              <span className="text-zinc-500 font-bold tracking-[0.2em] text-sm">
                {layout === 'arena' ? '360° STAGE' : 'STAGE'}
              </span>
            </div>

            {layout === 'arena' ? (
              // Custom 360 Arena Positioning
              <>
                {sectionGrid.map(({ sectionName, rows }) => {
                  let positionClass = "";
                  if (sectionName === "North Bowl") positionClass = "absolute top-0 left-1/2 -translate-x-1/2";
                  if (sectionName === "South Bowl") positionClass = "absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180";
                  if (sectionName === "East VIP") positionClass = "absolute left-0 top-1/2 -translate-y-1/2 -rotate-90";
                  if (sectionName === "West VIP") positionClass = "absolute right-0 top-1/2 -translate-y-1/2 rotate-90";

                  return (
                    <div key={sectionName} className={`flex flex-col items-center bg-zinc-950/30 p-6 rounded-3xl border border-zinc-800/30 shadow-xl ${positionClass}`}>
                      <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6 px-6 py-2 border border-zinc-800 rounded-full bg-zinc-900/80 shadow-lg flex items-center gap-2">
                        {(sectionName.toLowerCase().includes('vip') || sectionName.toLowerCase().includes('premium')) && <Sparkles className="w-3 h-3 text-amber-500" />}
                        {sectionName}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {rows.map(([row, rowSeats]) => (
                          <div key={row} className="flex items-center gap-4 group">
                            <div className="w-6 text-right text-sm font-bold text-zinc-600 group-hover:text-cyan-500 transition-colors">{row}</div>
                            <div className="flex gap-1.5">
                              {rowSeats.map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                            <div className="w-6 text-left text-sm font-bold text-zinc-600 group-hover:text-cyan-500 transition-colors">{row}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
            sectionGrid.map(({ sectionName, rows }, sectionIndex) => (
              <div 
                key={sectionName} 
                className={`
                  flex flex-col items-center bg-zinc-950/30 p-6 rounded-3xl border border-zinc-800/30 shadow-xl
                  ${layout === 'theater' && sectionIndex === 0 ? 'rotate-x-[5deg] scale-105' : ''}
                  ${layout === 'theater' && sectionIndex === 1 ? 'rotate-x-[15deg] translate-y-4 scale-95' : ''}
                  ${layout === 'theater' && sectionIndex === 2 ? 'rotate-x-[25deg] translate-y-8 scale-90 opacity-80' : ''}
                `}
                style={layout === 'theater' ? { transformStyle: 'preserve-3d' } : {}}
              >
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

                      <div className="flex gap-2 sm:gap-4">
                        {rowSeats.length > 20 ? (
                          <>
                            <div className="flex gap-1">
                              {rowSeats.slice(0, Math.floor(rowSeats.length / 3)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                            <div className="flex gap-1 px-4 border-x border-zinc-800/50">
                              {rowSeats.slice(Math.floor(rowSeats.length / 3), Math.floor(rowSeats.length * 2 / 3)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                            <div className="flex gap-1">
                              {rowSeats.slice(Math.floor(rowSeats.length * 2 / 3)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                          </>
                        ) : rowSeats.length > 10 ? (
                          <>
                            <div className="flex gap-1.5">
                              {rowSeats.slice(0, Math.floor(rowSeats.length / 2)).map((seat) => (
                                <SeatButton key={seat.id} seat={seat} onSelect={onSeatClick} getColor={getSeatColor} isSelected={selectedSeatIds.includes(seat.id)} />
                              ))}
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center text-zinc-800 font-bold text-xs">AISLE</div>
                            <div className="flex gap-1.5">
                              {rowSeats.slice(Math.floor(rowSeats.length / 2)).map((seat) => (
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
            )))}
          </div>
        </div>
      </div>

      {/* Modern Legend */}
      <div className="absolute bottom-0 left-0 w-full bg-[#0c111d]/90 backdrop-blur-xl border-t border-zinc-800/50 p-4 flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-amber-400">
          <div className="w-5 h-5 rounded-md bg-amber-400 border border-amber-500 flex items-center justify-center shadow-inner text-amber-950">
            <Sparkles className="w-3 h-3" />
          </div>
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2 text-purple-400">
          <div className="w-5 h-5 rounded-md bg-purple-500 border border-purple-600 shadow-inner"></div>
          <span>Premium</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-5 h-5 rounded-md bg-cyan-500 border border-cyan-600 shadow-inner"></div>
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-5 h-5 rounded-md bg-zinc-500 border border-zinc-400 animate-pulse shadow-inner"></div>
          <span>Held</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-900 opacity-50 relative overflow-hidden">
            <div className="absolute inset-0 border-t-2 border-red-500/20 rotate-45 scale-150 transform origin-center"></div>
          </div>
          <span>Sold Out</span>
        </div>
      </div>
    </div>
  );
}

function SeatButton({ seat, onSelect, getColor, isSelected }: { seat: ShowSeat, onSelect: (id: string) => void, getColor: any, isSelected: boolean }) {
  const isVip = seat.category === "VIP";
  const colorClass = getColor(seat.status, seat.category);
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
