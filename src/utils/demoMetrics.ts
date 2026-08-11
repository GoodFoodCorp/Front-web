/**
 * Deterministic placeholder business metrics (revenue, staff, ratings…)
 * for entities no service currently tracks — e.g. a restaurant's monthly
 * revenue/headcount, which would require a reporting/HR service that
 * doesn't exist yet. Seeded by id so the same restaurant always shows the
 * same numbers instead of jumping around on every render/reload.
 *
 * These are clearly-labelled demo figures, never presented as live data.
 */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

function seededRange(id: string, salt: string, min: number, max: number): number {
  const h = hashString(id + salt);
  return min + (h % (max - min + 1));
}

export interface FranchiseDemoMetrics {
  rating: number;
  monthlyRevenueCents: number;
  ordersPerMonth: number;
  staffCount: number;
  staffOnDuty: number;
  openedAt: string;
}

export function demoMetricsFor(restaurantId: string): FranchiseDemoMetrics {
  const rating = 3.6 + seededRange(restaurantId, 'rating', 0, 14) / 10;
  const monthlyRevenueCents = seededRange(restaurantId, 'revenue', 12000, 55000) * 100;
  const ordersPerMonth = seededRange(restaurantId, 'orders', 350, 1500);
  const staffCount = seededRange(restaurantId, 'staff', 8, 24);
  const staffOnDuty = Math.max(1, Math.round(staffCount * 0.35));
  const daysAgo = seededRange(restaurantId, 'opened', 20, 720);
  const opened = new Date();
  opened.setDate(opened.getDate() - daysAgo);

  return {
    rating: Math.round(rating * 10) / 10,
    monthlyRevenueCents,
    ordersPerMonth,
    staffCount,
    staffOnDuty,
    openedAt: opened.toISOString(),
  };
}

export function placeholderHeadcount(seed: string | null): number {
  if (!seed) return 0;
  return seededRange(seed, 'headcount', 8, 25);
}
