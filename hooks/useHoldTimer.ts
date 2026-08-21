import { useState, useEffect } from 'react';

interface UseHoldTimerProps {
  expiresAtIso: string;
  showId: string;
  seatIds: string[];
  userId: string;
  onExpire: () => void;
}

export function useHoldTimer({ expiresAtIso, showId, seatIds, userId, onExpire }: UseHoldTimerProps) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const expiresAt = new Date(expiresAtIso).getTime();

    const calculateRemaining = () => {
      const now = Date.now();
      const diff = expiresAt - now;
      return diff > 0 ? diff : 0;
    };

    // Initial calculation
    const initialRemaining = calculateRemaining();
    setRemainingMs(initialRemaining);
    
    if (initialRemaining <= 0) {
      setIsExpired(true);
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingMs(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAtIso, onExpire]);

  // Handle explicit abandonment on tab close / reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Fire and forget release request using fetch with keepalive flag
      // This ensures the browser continues the network request after the tab is destroyed.
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'}/rest/v1/rpc/release_held_seats`;
      const payload = {
        p_show_id: showId,
        p_seat_ids: seatIds,
        p_user_id: userId
      };

      const headers = {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'}`,
        'Content-Type': 'application/json'
      };

      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(console.error);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showId, seatIds, userId]);

  // Format mm:ss
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = remainingMs > 0 && remainingMs <= 2 * 60 * 1000; // <= 2 minutes

  const releaseManually = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'}/rest/v1/rpc/release_held_seats`;
      const payload = { p_show_id: showId, p_seat_ids: seatIds, p_user_id: userId };
      const headers = {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'}`,
        'Content-Type': 'application/json'
      };
      await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    } catch (e) {
      console.error("Failed to release manually:", e);
    }
    setIsExpired(true);
    onExpire();
  };

  return {
    remainingMs,
    formattedTime,
    isExpired,
    isLowTime,
    releaseManually
  };
}
