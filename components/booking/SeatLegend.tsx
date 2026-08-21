"use client";

import React from "react";
export const SeatLegend = () => {
  return (
    <div className="flex max-w-2xl flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-white/[0.08] bg-[#0b1720]/90 p-4 text-xs text-zinc-300 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-slate-500/50 bg-slate-600/20"></div>
        <span>Standard</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-indigo-400/50 bg-indigo-500/20"></div>
        <span>Premium</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-amber-400/50 bg-amber-500/20"></div>
        <span>VIP</span>
      </div>
      
      <div className="mx-1 h-5 w-px bg-zinc-700"></div>
      
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-zinc-700 bg-zinc-800"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-emerald-500 bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        <span>Your Hold</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center rounded border border-amber-700/50 bg-amber-900/40">
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(251,191,36,0.1)_2px,rgba(251,191,36,0.1)_4px)]"></div>
        </div>
        <span>Locked</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-slate-700 bg-slate-800 opacity-30"></div>
        <span>Sold</span>
      </div>
    </div>
  );
};
