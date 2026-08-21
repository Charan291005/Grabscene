import { useState, useEffect, useCallback } from 'react';
import { ShowSeat } from '../types/booking';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useShowSeatsRealtime(showId: string, initialSeats: ShowSeat[], currentUserId: string) {
  const [seats, setSeats] = useState<ShowSeat[]>(initialSeats);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isCancelled = false;

    const loadSeats = async () => {
      if (supabaseUrl.includes('placeholder')) return;

      const { data, error: loadError } = await supabase
        .from('show_seats')
        .select('id, status, price, held_by, hold_expires_at, seat_id, seats(row_identifier, seat_identifier, section_id, venue_sections(name))')
        .eq('show_id', showId)
        .order('id');

      if (loadError || !data || isCancelled) return;

      setSeats((data as any[]).map((seat) => {
        const localSeat = initialSeats.find(s => s.id === seat.seat_id);
        const sectionName = seat.seats?.venue_sections?.name;
        
        let category = localSeat?.category;
        if (!category) {
          const lowerSec = sectionName?.toLowerCase() || '';
          category = lowerSec.includes('vip') || lowerSec.includes('pit') || lowerSec.includes('orchestra') ? 'VIP' 
                   : lowerSec.includes('premium') || lowerSec.includes('mezzanine') || lowerSec.includes('lower') ? 'Premium' 
                   : 'Standard';
        }

        return {
          id: seat.id,
          row: seat.seats?.row_identifier ?? localSeat?.row ?? '?',
          seatNumber: seat.seats?.seat_identifier ?? localSeat?.seatNumber ?? '?',
          category,
          status: seat.status,
          price: Number(seat.price),
          heldByMe: seat.status === 'held' && seat.held_by === currentUserId,
          holdExpiresAt: seat.hold_expires_at,
          section: sectionName ?? localSeat?.section ?? 'Standard',
        };
      }));
    };

    loadSeats();

    // Subscribe to Postgres changes on show_seats table
    const channel = supabase.channel(`show_seats_changes_${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'show_seats',
          filter: `show_id=eq.${showId}`
        },
        (payload) => {
          const updatedSeat = (payload.new ?? payload.old) as {
            id?: string;
            seat_id?: string;
            status?: ShowSeat['status'];
            held_by?: string | null;
            hold_expires_at?: string | null;
          };
          if (payload.eventType === 'DELETE') {
            if (!updatedSeat.id) return;
            setSeats(prev => prev.filter(seat => seat.id !== updatedSeat.id));
            return;
          }
          if (!updatedSeat.id || !updatedSeat.status) return;
          const nextStatus = updatedSeat.status;
          setSeats(prev => prev.map(seat => {
            // Check if this seat exists in our state
            const targetSeatId = prev.find(s => s.id === updatedSeat.id || (s.id === updatedSeat.seat_id))?.id;
            
            if (seat.id === targetSeatId || seat.id === updatedSeat.id) {
              return {
                ...seat,
                status: nextStatus,
                heldByMe: nextStatus === 'held' && updatedSeat.held_by === currentUserId,
                holdExpiresAt: updatedSeat.hold_expires_at ?? null,
              };
            }
            return seat;
          }));
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [showId, currentUserId]);

  const optimisticHoldSeats = useCallback(async (seatIds: string[], userId: string) => {
    setError(null);
    
    // Optimistically update UI
    const previousSeats = seats;
    setSeats(prev => prev.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, status: 'held', heldByMe: true };
      }
      return seat;
    }));

    try {
      // Mocked delay if no real supabase configured, else actual RPC call
      if (supabaseUrl.includes('placeholder')) {
        await new Promise(res => setTimeout(res, 1000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        setSeats(prev => prev.map(seat => seatIds.includes(seat.id) ? { ...seat, holdExpiresAt: expiresAt, heldByMe: true } : seat));
        window.localStorage.setItem(`grabscene:hold:${showId}`, JSON.stringify({ seatIds, userId, expiresAt }));
        return { success: true };
      }

      // Real RPC call
      const { error: rpcError } = await supabase.rpc('hold_seats', {
        p_show_id: showId,
        p_seat_ids: seatIds,
        p_user_id: userId,
        p_ttl_minutes: 10
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to hold seats');
      }
      
      return { success: true };
    } catch (err: any) {
      // Revert optimistic update on failure
      setSeats(prev => prev.map(seat => {
        if (seatIds.includes(seat.id)) {
          return previousSeats.find(previous => previous.id === seat.id) ?? { ...seat, status: 'available', heldByMe: false };
        }
        return seat;
      }));
      setError(err.message || 'Conflict: Seats were already taken.');
      return { success: false, error: err.message };
    }
  }, [seats, showId]);

  useEffect(() => {
    if (!supabaseUrl.includes('placeholder')) return;

    const existingHold = window.localStorage.getItem(`grabscene:hold:${showId}`);
    if (existingHold) {
      const hold = JSON.parse(existingHold) as { seatIds: string[]; userId: string; expiresAt: string };
      if (Date.parse(hold.expiresAt) > Date.now()) {
        setSeats(prev => prev.map(seat => hold.seatIds.includes(seat.id) ? {
          ...seat,
          status: 'held',
          heldByMe: hold.userId === currentUserId,
          holdExpiresAt: hold.expiresAt,
        } : seat));
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !event.newValue) return;

      if (event.key === `grabscene:hold:${showId}`) {
        const hold = JSON.parse(event.newValue) as { seatIds: string[]; userId: string; expiresAt: string };
        if (hold.userId === currentUserId) return;
        setSeats(prev => prev.map(seat => hold.seatIds.includes(seat.id) ? { ...seat, status: 'held', heldByMe: false, holdExpiresAt: hold.expiresAt } : seat));
      }

      if (event.key === `grabscene:booking:${showId}`) {
        const booking = JSON.parse(event.newValue) as { seatIds: string[] };
        setSeats(prev => prev.map(seat => booking.seatIds.includes(seat.id) ? { ...seat, status: 'booked', heldByMe: false, holdExpiresAt: null } : seat));
      }

      if (event.key === `grabscene:release:${showId}`) {
        const release = JSON.parse(event.newValue) as { seatIds: string[] };
        setSeats(prev => prev.map(seat => release.seatIds.includes(seat.id) ? { ...seat, status: 'available', heldByMe: false, holdExpiresAt: null } : seat));
      }
    };

    window.addEventListener('storage', handleStorage);
    const expiryTimer = window.setInterval(() => {
      const rawHold = window.localStorage.getItem(`grabscene:hold:${showId}`);
      if (!rawHold) return;
      const hold = JSON.parse(rawHold) as { seatIds: string[]; expiresAt: string };
      if (Date.parse(hold.expiresAt) > Date.now()) return;
      setSeats(prev => prev.map(seat => hold.seatIds.includes(seat.id) && seat.status === 'held' ? { ...seat, status: 'available', heldByMe: false, holdExpiresAt: null } : seat));
      window.localStorage.removeItem(`grabscene:hold:${showId}`);
      window.localStorage.setItem(`grabscene:release:${showId}`, JSON.stringify({ seatIds: hold.seatIds, releasedAt: Date.now() }));
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(expiryTimer);
    };
  }, [showId, currentUserId]);

  return { seats, setSeats, optimisticHoldSeats, error };
}
