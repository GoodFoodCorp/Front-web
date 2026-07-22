export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';

export interface Reservation {
  _id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  phone: string;
  partySize: number;
  reservationAt: string;
  status: ReservationStatus;
  notes: string;
}

export interface ReservationForm {
  restaurantId: string;
  customerName: string;
  phone?: string;
  partySize: number;
  reservationAt: string;
  notes?: string;
}
