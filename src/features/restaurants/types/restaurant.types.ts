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
