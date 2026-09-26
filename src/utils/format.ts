/** Formats a price given in cents as a French euro string. */
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
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
  return `${Math.round((cancelled / total) * 100)}% des commandes`;
}
