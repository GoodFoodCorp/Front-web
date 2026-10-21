import type { RecipeLine } from '../../features/catalog/types/menu.types';

const MAX_QUANTITY = 999999999.999;
export const MAX_RECIPE_LINES = 50;

/**
 * Parses a quantity typed by the user. Accepts a comma or a dot as decimal
 * separator ("0,15" → 0.15) and rounds to 3 decimals (backend precision).
 * Returns 0 for anything empty, non-numeric or ≤ 0.
 */
export function parseQuantity(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(normalized)) return 0;
  const value = Math.round(Number(normalized) * 1000) / 1000;
  return Number.isFinite(value) && value > 0 && value <= MAX_QUANTITY ? value : 0;
}

/** Client-side check before calling the API; returns a French message or null. */
export function validateRecipe(lines: RecipeLine[]): string | null {
  if (lines.length > MAX_RECIPE_LINES) return `Une recette ne peut pas dépasser ${MAX_RECIPE_LINES} ingrédients.`;
  for (const line of lines) {
    if (!line.stockItemId) return 'Choisissez un article du stock pour chaque ingrédient de la recette.';
    if (!(line.quantity > 0)) {
      return `Indiquez une quantité supérieure à 0 pour « ${line.stockItemName} ».`;
    }
  }
  return null;
}
