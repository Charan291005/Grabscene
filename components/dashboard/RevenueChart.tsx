"use client";

import React from 'react';

// A mock beautiful area chart representing revenue over time
export const RevenueChart = () => {
  const dataPoints = [40, 55, 45, 75, 60, 90, 85, 110, 100, 130, 115, 140];
  
  return (
    <div className="w-full h-48 relative flex items-end">
      {/* Background Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div className="w-full border-t border-zinc-800/50 h-0"></div>
        <div className="w-full border-t border-zinc-800/50 h-0"></div>
        <div className="w-full border-t border-zinc-800/50 h-0"></div>
        <div className="w-full border-t border-zinc-800/50 h-0"></div>
      </div>
      
      {/* Bars/Area */}
      <div className="relative z-10 w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-2 pt-4">
        {dataPoints.map((val, idx) => (
          <div key={idx} className="flex-1 relative group h-full flex items-end justify-center">
            <div 
              className="w-full bg-gradient-to-t from-cyan-500/10 via-cyan-500/40 to-cyan-400 rounded-t-sm transition-all duration-300 group-hover:opacity-100 opacity-70"
              style={{ height: `${(val / 140) * 100}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1 px-2 rounded transition-opacity pointer-events-none z-20">
                ${val}k
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
