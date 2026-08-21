"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShowSeat } from "../../types/booking";
import { cn } from "../../lib/utils";
import { Lock } from "lucide-react";

interface Props {
  seats: ShowSeat[];
  selectedSeatIds: Set<string>;
  onSeatClick: (seat: ShowSeat) => void;
}

export const SeatMap = ({ seats, selectedSeatIds, onSeatClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();
  const seatsByRow = rows.map((row) => ({
    row,
    seats: seats
      .filter((s) => s.row === row)
      .sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber)),
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.5, transform.scale + delta), 3);
      setTransform((prev) => ({ ...prev, scale: newScale }));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [transform.scale]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const getSeatLabel = (seat: ShowSeat) => {
    const isSelected = selectedSeatIds.has(seat.id);
    const isLocked = seat.status === "held" && !seat.heldByMe;
    const isSold = seat.status === "booked";
    const isHeldByMe = seat.status === "held" && seat.heldByMe;

    let statusText = "available";
    if (isSelected) statusText = "selected";
    else if (isHeldByMe) statusText = "held by you";
    else if (isLocked) statusText = "locked by another user";
    else if (isSold) statusText = "sold";

    return `Row ${seat.row}, Seat ${seat.seatNumber}, ${seat.category}, $${seat.price}, ${statusText}`;
  };

  return (
    <div
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-[#090D16] rounded-2xl border border-zinc-800/50 touch-none flex items-center justify-center"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="application"
      aria-label="Interactive seat map. Use mouse to pan and zoom, or tab to navigate individual seats."
      aria-roledescription="seat map"
    >
      {/* Cinema Screen Indicator */}
      <div
        className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-12 pointer-events-none z-10 flex flex-col items-center"
        aria-hidden="true"
      >
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-full opacity-50 blur-[2px]" />
        <div
          className="w-full h-8 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent"
          style={{ clipPath: "ellipse(50% 100% at 50% 0%)" }}
        />
        <span className="text-xs font-medium tracking-[0.3em] text-cyan-500/50 uppercase mt-2">
          Stage
        </span>
      </div>

      {/* Grid Container */}
      <div
        className="origin-center transition-transform duration-75 ease-linear will-change-transform mt-20"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <div
          className="flex flex-col gap-4 items-center cursor-grab active:cursor-grabbing p-12"
          role="grid"
          aria-label="Seat grid"
        >
          {seatsByRow.map(({ row, seats: rowSeats }) => (
            <div key={row} className="flex gap-4 items-center" role="row">
              <div
                className="w-6 text-right font-mono text-sm text-zinc-600 font-medium select-none"
                aria-hidden="true"
              >
                {row}
              </div>
              <div className="flex gap-2" role="rowgroup">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.has(seat.id);
                  const isAvailable = seat.status === "available";
                  const isHeldByMe =
                    seat.status === "held" && seat.heldByMe;
                  const isLocked =
                    seat.status === "held" && !seat.heldByMe;
                  const isSold = seat.status === "booked";

                  let categoryStyles = "";
                  if (seat.category === "VIP")
                    categoryStyles =
                      "bg-amber-500/20 border-amber-400/50 text-amber-500 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(251,191,36,0.4)]";
                  if (seat.category === "Premium")
                    categoryStyles =
                      "bg-indigo-500/20 border-indigo-400/50 text-indigo-400 hover:border-indigo-400 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)]";
                  if (seat.category === "Standard")
                    categoryStyles =
                      "bg-slate-600/20 border-slate-500/50 text-slate-300 hover:border-slate-400 hover:shadow-[0_0_12px_rgba(148,163,184,0.4)]";

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAvailable || isSelected) {
                          onSeatClick(seat);
                        }
                      }}
                      disabled={
                        isLocked || isSold || (isHeldByMe && !isSelected)
                      }
                      role="gridcell"
                      aria-label={getSeatLabel(seat)}
                      aria-pressed={isSelected}
                      aria-disabled={
                        isLocked || isSold || (isHeldByMe && !isSelected)
                      }
                      className={cn(
                        "group relative w-10 h-10 rounded-t-lg rounded-b-sm border transition-all duration-200 flex items-center justify-center text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090D16]",
                        isAvailable && !isSelected && categoryStyles,
                        isSelected &&
                          "bg-emerald-500/30 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-110 z-10",
                        isHeldByMe &&
                          !isSelected &&
                          "bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-not-allowed",
                        isLocked &&
                          "bg-amber-900/40 border-amber-700/50 cursor-not-allowed",
                        isSold &&
                          "bg-slate-800 opacity-30 border-slate-700 cursor-not-allowed"
                      )}
                    >
                      <div
                        className="absolute bottom-1 w-3/4 h-1 bg-white/10 rounded-full"
                        aria-hidden="true"
                      />

                      {isLocked && (
                        <div
                          className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(251,191,36,0.1)_2px,rgba(251,191,36,0.1)_4px)] rounded-t-lg rounded-b-sm pointer-events-none"
                          aria-hidden="true"
                        />
                      )}
                      {isLocked && (
                        <Lock
                          className="w-3 h-3 text-amber-500/50 absolute z-10"
                          aria-hidden="true"
                        />
                      )}

                      {!isLocked && !isSold && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {seat.seatNumber}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                className="w-6 text-left font-mono text-sm text-zinc-600 font-medium select-none"
                aria-hidden="true"
              >
                {row}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-6 right-6 flex flex-col gap-2 z-20"
        role="toolbar"
        aria-label="Zoom controls"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setTransform((p) => ({
              ...p,
              scale: Math.min(3, p.scale + 0.2),
            }));
          }}
          className="w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur border border-zinc-700 rounded-full flex items-center justify-center text-zinc-300 transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setTransform((p) => ({
              ...p,
              scale: Math.max(0.5, p.scale - 0.2),
            }));
          }}
          className="w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur border border-zinc-700 rounded-full flex items-center justify-center text-zinc-300 transition-colors"
          aria-label="Zoom out"
        >
          -
        </button>
      </div>
    </div>
  );
};
