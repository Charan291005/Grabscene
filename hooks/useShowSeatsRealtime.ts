import { useState, useEffect, useCallback } from 'react';
import { ShowSeat } from '../types/booking';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useShowSeatsRealtime(showId: string, initialSeats: ShowSeat[]) {
  const [seats, setSeats] = useState<ShowSeat[]>(initialSeats);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isCancelled = false;

    const loadSeats = async () => {
      if (supabaseUrl.includes('placeholder')) return;

      const { data, error: loadError } = await supabase
        .from('show_seats')
        .select('id, status, price, seat_id, seats(row_identifier, seat_identifier, section_id, venue_sections(name))')
        .eq('show_id', showId)
        .order('id');

      if (loadError || !data || isCancelled) return;

      setSeats((data as any[]).map((seat) => {
        const sectionName = seat.seats?.venue_sections?.name;
        const category = sectionName === 'VIP' ? 'VIP' : sectionName === 'Premium' ? 'Premium' : 'Standard';
        return {
          id: seat.id,
          row: seat.seats?.row_identifier ?? '?',
          seatNumber: seat.seats?.seat_identifier ?? '?',
          category,
          status: seat.status,
          price: Number(seat.price),
          heldByMe: false,
        };
      }));
    };

    loadSeats();

    // Subscribe to Postgres changes on show_seats table
    const channel = supabase.channel(`show_seats_changes_${showId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'show_seats',
          filter: `show_id=eq.${showId}`
        },
        (payload) => {
          const updatedSeat = payload.new;
          setSeats(prev => prev.map(seat => {
            // Check if this seat exists in our state
            const targetSeatId = prev.find(s => s.id === updatedSeat.id || (s.id === updatedSeat.seat_id))?.id;
            
            if (seat.id === targetSeatId || seat.id === updatedSeat.id) {
              return {
                ...seat,
                status: updatedSeat.status,
                // heldByMe would ideally be checked against auth context
                heldByMe: updatedSeat.status === 'held' ? seat.heldByMe : false
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
  }, [showId]);

  const optimisticHoldSeats = useCallback(async (seatIds: string[], userId: string) => {
    setError(null);
    
    // Optimistically update UI
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
        // Simulate a random conflict
        if (Math.random() > 0.8) {
          throw new Error(`Seats ${seatIds[0]} were locked by another user.`);
        }
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
          return { ...seat, status: 'available', heldByMe: false };
        }
        return seat;
      }));
      setError(err.message || 'Conflict: Seats were already taken.');
      return { success: false, error: err.message };
    }
  }, [showId]);

  return { seats, setSeats, optimisticHoldSeats, error };
}
