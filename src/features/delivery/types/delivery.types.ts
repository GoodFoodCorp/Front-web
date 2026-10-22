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
}

export interface LastPosition {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface DeliveryDetail {
  delivery: Delivery;
  lastPosition: LastPosition | null;
}
