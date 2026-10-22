import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { RecipeLine } from '../../features/catalog/types/menu.types';
import type { StockItem } from '../../features/stock/types/stock.types';
import { Button } from '../Button';
import { Input } from '../Input';
import { MAX_RECIPE_LINES, parseQuantity } from './recipeLines';

const SELECT_CLASS =
  'w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand';

export type StockStatus = 'loading' | 'error' | 'ready';

/**
 * Pure UI editor for a dish recipe: one row per ingredient (stock article +
 * quantity in the article's unit). An unchosen row has an empty stockItemId
 * and quantity 0 — use validateRecipe() before saving. Quantities are typed
 * as text so French users can enter "0,15"; `onChange` always receives numbers.
 */
export function RecipeEditor({
  value,
  onChange,
  stockItems,
  stockStatus = 'ready',
}: {
  value: RecipeLine[];
  onChange: (lines: RecipeLine[]) => void;
  stockItems: StockItem[];
  /** State of the stock list query; saved lines display whatever it is. */
  stockStatus?: StockStatus;
}) {
  // Raw text being typed, by row index; absent = show the numeric value.
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  if (stockStatus === 'ready' && stockItems.length === 0 && value.length === 0) {
    return (
      <p className="rounded-xl bg-brand-pale px-4 py-3 text-sm text-brand">
        Votre restaurant n'a encore aucun article en stock. Créez-les d'abord dans la page <strong>Stock</strong> pour
        pouvoir composer une recette.
      </p>
    );
  }

  const patch = (index: number, line: RecipeLine) => onChange(value.map((l, i) => (i === index ? line : l)));

  const pick = (index: number, stockItemId: string) => {
    const item = stockItems.find((s) => s.id === stockItemId);
    if (!item) return;
    patch(index, { ...value[index], stockItemId: item.id, stockItemName: item.name, unit: item.unit });
  };

  const type = (index: number, raw: string) => {
    setDrafts((d) => ({ ...d, [index]: raw }));
    patch(index, { ...value[index], quantity: parseQuantity(raw) });
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setDrafts({});
  };

  const chosen = new Set(value.map((l) => l.stockItemId));
  const canAdd =
    stockStatus === 'ready' &&
    value.length < MAX_RECIPE_LINES &&
    value.every((l) => l.stockItemId) && stockItems.some((s) => !chosen.has(s.id));

  return (
    <div className="space-y-2">
      {stockStatus === 'loading' && <p className="text-sm text-neutral-400">Chargement du stock…</p>}
      {stockStatus === 'error' && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Impossible de charger votre stock.</p>
      )}
      {value.length === 0 && (
        <p className="text-sm text-neutral-400">
          Aucun ingrédient suivi : ce plat ne décrémente pas le stock. Ajoutez des ingrédients pour le suivre.
        </p>
      )}
      {value.map((line, index) => {
        const known = stockItems.some((s) => s.id === line.stockItemId);
        const draft = drafts[index] ?? (line.quantity > 0 ? String(line.quantity) : '');
        return (
          <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_3rem_2.5rem] items-center gap-2">
            <select
              aria-label={`Article du stock, ingrédient ${index + 1}`}
              className={SELECT_CLASS}
              value={line.stockItemId}
              onChange={(e) => pick(index, e.target.value)}
            >
              <option value="" disabled>
                Choisir un article…
              </option>
              {/* Keep a recipe line whose article no longer exists visible. */}
              {line.stockItemId && !known && <option value={line.stockItemId}>{line.stockItemName}</option>}
              {stockItems
                .filter((s) => s.id === line.stockItemId || !chosen.has(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <Input
              aria-label={`Quantité, ingrédient ${index + 1}`}
              type="text"
              inputMode="decimal"
              placeholder="Quantité"
              disabled={!line.stockItemId}
              value={draft}
              onChange={(e) => type(index, e.target.value)}
            />
            <span className="truncate text-sm text-neutral-500">{line.unit}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Retirer ${line.stockItemName || `l'ingrédient ${index + 1}`}`}
              className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        className="px-3 py-1.5 text-sm"
        disabled={!canAdd}
        onClick={() => onChange([...value, { stockItemId: '', stockItemName: '', unit: '', quantity: 0 }])}
      >
        <Plus size={15} /> Ajouter un ingrédient
      </Button>
    </div>
  );
}
