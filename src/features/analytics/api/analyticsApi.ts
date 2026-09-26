import { http } from '../../../services/http';
import type { Metrics, MetricsDto } from '../types/analytics.types';

function toMetrics(d: MetricsDto): Metrics {
  return {
    periodDays: d.period_days,
    revenueCents: d.revenue_cents,
    ordersCount: d.orders_count,
    cancelledCount: d.cancelled_count,
    averageBasketCents: d.average_basket_cents,
    ordersByStatus: d.orders_by_status,
    revenueByDay: d.revenue_by_day.map((p) => ({
      day: p.day,
      revenueCents: p.revenue_cents,
      ordersCount: p.orders_count,
    })),
    topDishes: d.top_dishes.map((t) => ({
      menuItemId: t.menu_item_id,
      name: t.name,
      quantity: t.quantity,
      revenueCents: t.revenue_cents,
    })),
    topRestaurants: d.top_restaurants.map((r) => ({
      restaurantId: r.restaurant_id,
      name: r.name,
      revenueCents: r.revenue_cents,
      ordersCount: r.orders_count,
    })),
    computedAt: d.computed_at,
    restaurantId: d.restaurant_id,
    restaurantName: d.restaurant_name,
  };
}

/** KPI are computed by analytics-service (Python), never in the browser. */
export const analyticsApi = {
  /** Head office: the whole network. */
  network: async (days: number): Promise<Metrics> =>
    toMetrics(await http<MetricsDto>(`/api/analytics/network?days=${days}`)),

  /** Franchisee: their own restaurant (head office may target one). */
  restaurant: async (days: number, restaurantId?: string): Promise<Metrics> => {
    const target = restaurantId ? `&restaurantId=${restaurantId}` : '';
    return toMetrics(await http<MetricsDto>(`/api/analytics/restaurant?days=${days}${target}`));
  },
};
