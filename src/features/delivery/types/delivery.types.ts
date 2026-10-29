export type DeliveryStatus = 'UNASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface GeoPoint {
  address: string;
  lat: number;
  lng: number;
}

export interface Delivery {
  _id: string;
  orderId: string;
  customerId: string;
  restaurantId: string;
  livreurId: string | null;
  status: DeliveryStatus;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryTime: string | null;
  /** Courier pay in cents; null on deliveries created before fees existed. */
  courierFeeCents: number | null;
  tipCents?: number;
  rating?: number | null;
}

/** What a courier sees of a delivery before accepting it (no customer data). */
export interface AvailableDelivery {
  id: string;
  orderId: string;
  pickup: GeoPoint;
  dropoffArea: { lat: number; lng: number };
  distanceKm: number;
  courierFeeCents: number;
  tipCents: number;
  estimatedDeliveryTime: string | null;
}

export interface LastPosition {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface DeliveryDetail {
  delivery: Delivery;
  lastPosition: LastPosition | null;
  /** Given to the courier at the door; only the customer receives it. */
  handoverCode?: string;
}
