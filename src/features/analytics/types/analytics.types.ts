/** KPI served by analytics-service, which aggregates the other services. */

export interface DayPoint {
  day: string;
  revenueCents: number;
  ordersCount: number;
}

export interface TopDish {
  menuItemId: string;
  name: string;
  quantity: number;
  revenueCents: number;
}

export interface RestaurantBreakdown {
  restaurantId: string;
  name: string;
  revenueCents: number;
  ordersCount: number;
}

export interface Metrics {
  periodDays: number;
  revenueCents: number;
  ordersCount: number;
  cancelledCount: number;
  averageBasketCents: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: DayPoint[];
  topDishes: TopDish[];
  topRestaurants: RestaurantBreakdown[];
  computedAt: string;
  restaurantId: string | null;
  restaurantName: string | null;
}

/** Raw shape returned by analytics-service (snake_case). */
export interface MetricsDto {
  period_days: number;
  revenue_cents: number;
  orders_count: number;
  cancelled_count: number;
  average_basket_cents: number;
  orders_by_status: Record<string, number>;
  revenue_by_day: { day: string; revenue_cents: number; orders_count: number }[];
  top_dishes: { menu_item_id: string; name: string; quantity: number; revenue_cents: number }[];
  top_restaurants: { restaurant_id: string; name: string; revenue_cents: number; orders_count: number }[];
  computed_at: string;
  restaurant_id: string | null;
  restaurant_name: string | null;
}
