export type SeatCategory = 'Standard' | 'Premium' | 'VIP';
export type SeatStatus = 'available' | 'held' | 'booked';

export interface ShowSeat {
  id: string; // show_seat_id
  row: string;
  seatNumber: string;
  category: SeatCategory;
  status: SeatStatus;
  price: number;
  heldByMe: boolean; // Set to true if current user holds it
}
