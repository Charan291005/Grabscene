"use client";

import React, { useEffect, useState } from 'react';
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
  const [shouldShake, setShouldShake] = useState(false);

  // Trigger shake at low time thresholds
  useEffect(() => {
    if (isLowTime && !isExpired) {
      setShouldShake(true);
      const t = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [isLowTime, isExpired, Math.floor(progressPercent / 5)]); // re-trigger periodically

  return (
    <div className={cn(
      "flex items-center gap-4 px-5 py-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-500",
      isExpired ? "bg-red-500/10 border-red-500/50" : 
      isLowTime ? "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : 
      "bg-amber-500/10 border-amber-500/30",
      shouldShake ? "animate-shake" : ""
    )}>
      {/* Circular Progress */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0" aria-hidden="true">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48" role="img" aria-label="Time remaining progress">
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
            strokeLinecap="round"
            className={cn(
              "transition-[stroke-dashoffset] duration-1000 ease-linear",
              isLowTime ? "text-red-500" : "text-amber-400"
            )}
          />
        </svg>
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-colors duration-500",
          isExpired ? "text-red-400" : isLowTime ? "text-red-400" : "text-amber-400"
        )}>
          {isLowTime ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>
      </div>

      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-semibold uppercase tracking-wider transition-colors duration-500",
          isExpired ? "text-red-400" : isLowTime ? "text-red-400" : "text-amber-400"
        )}>
          {isExpired ? "Hold Expired" : "Time Remaining"}
        </span>
        <span className={cn(
          "text-2xl font-mono font-bold leading-none tabular-nums transition-colors duration-500",
          isExpired ? "text-red-300" : isLowTime ? "text-red-100" : "text-white"
        )}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
