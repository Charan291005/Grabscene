"use client";

import React from "react";
import { cn } from "../../lib/utils";

export const SeatLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm text-sm text-zinc-300">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-slate-600/20 border border-slate-500/50"></div>
        <span>Standard</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-400/50"></div>
        <span>Premium</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-400/50"></div>
        <span>VIP</span>
      </div>
      
      <div className="w-[1px] h-6 bg-zinc-700 mx-2"></div>
      
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        <span>Your Hold</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-amber-900/40 border border-amber-700/50 flex items-center justify-center">
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(251,191,36,0.1)_2px,rgba(251,191,36,0.1)_4px)]"></div>
        </div>
        <span>Locked</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-slate-800 opacity-30 border border-slate-700"></div>
        <span>Sold</span>
      </div>
    </div>
  );
};
