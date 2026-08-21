"use client";

import React from 'react';
import { cn } from '../../lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  formattedTime: string;
  isLowTime: boolean;
  isExpired: boolean;
  progressPercent: number; // 0 to 100
}

export const HoldCountdownTimer = ({ formattedTime, isLowTime, isExpired, progressPercent }: Props) => {
  // SVG circle math
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={cn(
      "flex items-center gap-4 px-5 py-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-500",
      isExpired ? "bg-red-500/10 border-red-500/50" : 
      isLowTime ? "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse" : 
      "bg-amber-500/10 border-amber-500/30"
    )}>
      {/* Circular Progress */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="opacity-20"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isLowTime ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>
      </div>

      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-semibold uppercase tracking-wider",
          isExpired ? "text-red-400" : isLowTime ? "text-red-400" : "text-amber-400"
        )}>
          {isExpired ? "Hold Expired" : "Time Remaining"}
        </span>
        <span className={cn(
          "text-2xl font-mono font-bold leading-none tabular-nums",
          isExpired ? "text-red-300" : isLowTime ? "text-red-100" : "text-white"
        )}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
