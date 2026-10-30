/** Restaurants (franchises) are owned by franchise-service. Their id is the
 *  tenant id every other service scopes its data by. */
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  plan: string;
  isActive: boolean;
  phone?: string;
  timeZone?: string;
  openingHours?: OpeningSlot[];
  isOpenNow?: boolean;
  acceptingOrders?: boolean;
  prepTimeMinutes?: number;
  deliveryRadiusKm?: number;
  deliveryFeeCents?: number;
  minimumOrderCents?: number;
  seatingCapacity?: number;
  latitude?: number | null;
  longitude?: number | null;
}

/** A street address proposed while typing (EU member states only). */
export interface AddressSuggestion {
  label: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

/** day: 0 = Sunday … 6 = Saturday; times are HH:mm, restaurant local time. */
export interface OpeningSlot {
  day: number;
  opens: string;
  closes: string;
}

/** franchise-service's answer: can it take this order now, at what fee. */
export interface DeliveryQuote {
  canOrder: boolean;
  refusal: 'INACTIVE' | 'CLOSED' | 'PAUSED' | 'OUTOFZONE' | 'UNKNOWNADDRESS' | null;
  isOpen: boolean;
  acceptingOrders: boolean;
  distanceKm: number | null;
  deliveryFeeCents: number;
  minimumOrderCents: number;
  prepTimeMinutes: number;
  estimatedDeliveryMinutes: number;
}

export interface OperationsForm {
  phone: string;
  timeZone: string;
  openingHours: OpeningSlot[];
  prepTimeMinutes: number;
  deliveryRadiusKm: number;
  deliveryFeeCents: number;
  minimumOrderCents: number;
  seatingCapacity: number;
}

/** Payload for creating/updating a restaurant (siège only). */
export interface RestaurantForm {
  name: string;
  slug: string;
  address: string;
  city: string;
  plan: string;
  isActive: boolean;
}
