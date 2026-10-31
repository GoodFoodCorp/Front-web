/** "4,3" — one decimal, French style. */
export function formatRating(average: number): string {
  return average.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export const RATING_LABELS = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'] as const;
