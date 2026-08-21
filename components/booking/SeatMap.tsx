"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShowSeat } from "../../types/booking";
import { cn } from "../../lib/utils";
import { Lock } from "lucide-react";

interface Props {
  seats: ShowSeat[];
  selectedSeatIds: Set<string>;
  onSeatClick: (seat: ShowSeat) => void;
  layout?: "concert" | "arena" | "theater";
}

export const SeatMap = ({ seats, selectedSeatIds, onSeatClick, layout = "concert" }: Props) => {
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
  const middleRow = Math.max(0, (rows.length - 1) / 2);

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
      className="relative w-full h-full min-h-[620px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#071016] touch-none flex items-center justify-center"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="application"
      aria-label="Interactive seat map. Use mouse to pan and zoom, or tab to navigate individual seats."
      aria-roledescription="seat map"
    >
      <div className="absolute inset-4 rounded-[2rem] border border-white/[0.05] bg-[radial-gradient(ellipse_at_center,rgba(19,134,154,0.12),transparent_62%)]" aria-hidden="true" />

      <div className="absolute top-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center" aria-hidden="true">
        <div className="flex h-10 w-56 items-center justify-center rounded-t-[2rem] border border-cyan-300/50 bg-cyan-400/15 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_36px_rgba(50,184,196,0.18)]">
          Main stage
        </div>
        {layout === "concert" && <div className="h-14 w-20 border-x border-cyan-300/35 bg-cyan-400/10" />}
        <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/60">
          {layout === "concert" ? "Orchestra pit · catwalk" : layout === "arena" ? "Floor standing" : "Screen / stage"}
        </span>
      </div>

      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-600 [writing-mode:vertical-rl]" aria-hidden="true">West stand</div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-600 [writing-mode:vertical-rl]" aria-hidden="true">East stand</div>

      {/* Grid Container */}
      <div
        className="relative z-10 origin-center transition-transform duration-75 ease-linear will-change-transform mt-28"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <div
          className="flex flex-col gap-3 items-center cursor-grab active:cursor-grabbing rounded-[3rem] border border-white/[0.06] bg-black/10 p-10"
          role="grid"
          aria-label="Seat grid"
        >
          {seatsByRow.map(({ row, seats: rowSeats }, rowIndex) => (
            <div
              key={row}
              className={cn("flex items-center", layout === "concert" ? "gap-3" : "gap-4")}
              style={layout === "concert" ? {
                transform: `translateX(${Math.round(Math.sin((rowIndex / Math.max(rows.length - 1, 1)) * Math.PI) * 52 - 26)}px) scaleX(${1 + Math.sin((rowIndex / Math.max(rows.length - 1, 1)) * Math.PI) * 0.08})`,
              } : undefined}
              role="row"
            >
              <div
                className="w-7 text-right font-mono text-[10px] font-semibold tracking-wider text-zinc-500 select-none"
                aria-hidden="true"
              >
                {row}
              </div>
              <div className={cn("flex gap-1.5 rounded-full px-2 py-1", rowIndex >= middleRow ? "bg-white/[0.025]" : "bg-cyan-300/[0.025]", layout === "concert" && "[&>button:nth-child(10)]:mr-5")} role="rowgroup">
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
                        "group relative h-7 w-7 rounded-[5px] border transition-all duration-200 flex items-center justify-center text-[9px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071016]",
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
                className="w-7 text-left font-mono text-[10px] font-semibold tracking-wider text-zinc-500 select-none"
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
            setTransform({ x: 0, y: 0, scale: 1 });
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-xs font-semibold text-zinc-300 backdrop-blur transition-colors hover:border-cyan-400 hover:text-cyan-300"
          aria-label="Reset map view"
          title="Reset map view"
        >
          1:1
        </button>
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
