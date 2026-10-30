const EUROS = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const COUNT = new Intl.NumberFormat('fr-FR');

/** Formats a price given in cents as a French euro string: 18 585,69 €. */
export function formatPrice(cents: number): string {
  return EUROS.format(cents / 100);
}

/** A count with French thousands separators: 1 431. */
export function formatCount(n: number): string {
  return COUNT.format(n);
}

/** "1 vendu", "3 vendus". */
export function plural(n: number, word: string): string {
  return `${formatCount(n)} ${word}${Math.abs(n) > 1 ? 's' : ''}`;
}

/** Formats an ISO date as a short French date/time. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Share of orders that were cancelled, for a KPI tile hint. */
export function formatCancellationRate(cancelled: number, total: number): string | undefined {
  if (total === 0) return undefined;
  const rate = (cancelled / total) * 100;
  const shown = rate > 0 && rate < 10 ? rate.toFixed(1).replace('.', ',') : String(Math.round(rate));
  return `${shown} % des commandes`;
}

/** One line per dish name: a head-office dish sold by several restaurants
 *  comes back once per restaurant. */
export function mergeDishes<T extends { name: string; quantity: number }>(dishes: T[]): T[] {
  const byName = new Map<string, T>();
  for (const d of dishes) {
    const seen = byName.get(d.name);
    byName.set(d.name, seen ? { ...seen, quantity: seen.quantity + d.quantity } : { ...d });
  }
  return [...byName.values()].sort((a, b) => b.quantity - a.quantity);
}
