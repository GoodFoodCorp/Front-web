import { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, ImagePlus, Lock, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import {
  useCategories,
  useCreateMenuItem,
  useCreateMenuPlan,
  useDeleteMenuItem,
  useDeleteMenuPlan,
  useMyMenu,
  useMyMenuPlans,
  useRestaurantMenu,
  useToggleMenuItem,
  useToggleMenuPlan,
  useUpdateMenuItem,
  useUpdateMenuPlan,
} from '../features/catalog/hooks/useMenu';
import type { MenuItem, MenuItemForm, MenuPlan, MenuPlanForm } from '../features/catalog/types/menu.types';
import { useStocks } from '../features/stock/hooks/useStock';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';
import { dishPhoto } from '../utils/images';
import { fileToCompressedDataUrl } from '../utils/imageUpload';

const ALL = 'Toutes les catégories';

type Tab = 'plans' | 'dishes';

export function CatalogManagementPage() {
  const isAdmin = useAuthStore((s) => s.roles.includes('admin'));
  const [tab, setTab] = useState<Tab>('plans');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Menus & Plats</h1>
          <p className="text-neutral-500">
            {isAdmin
              ? 'Catalogue commun, visible par tous les franchisés du réseau'
              : "Les menus et plats de votre restaurant, visibles par vos clients"}
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-xs font-semibold text-neutral-400">Portée</p>
          <Badge tone={isAdmin ? 'yellow' : 'green'}>{isAdmin ? 'Réseau (siège)' : 'Mon restaurant'}</Badge>
        </div>
      </div>

      <div className="flex gap-2 border-b border-brand/10">
        <TabButton active={tab === 'plans'} onClick={() => setTab('plans')}>
          Menus
        </TabButton>
        <TabButton active={tab === 'dishes'} onClick={() => setTab('dishes')}>
          Plats
        </TabButton>
      </div>

      {tab === 'plans' ? <MenuPlansTab isAdmin={isAdmin} /> : <DishesTab isAdmin={isAdmin} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
        active ? 'border-brand text-brand' : 'border-transparent text-neutral-400 hover:text-brand'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The pool of dishes an actor may browse/pick from: a franchisee sees their
 * own dishes plus the global catalog (merged, available only — same view a
 * customer gets); admin's "own" catalog already *is* the global one.
 */
function useDishPool(isAdmin: boolean) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const merged = useRestaurantMenu(isAdmin ? undefined : tenantId ?? undefined);
  const mine = useMyMenu();
  return isAdmin ? mine : merged;
}

// ─────────────────────────────────────────── Plats (dishes) ──────────────

function DishesTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: items, isLoading } = useMyMenu();
  const { data: stocks } = useStocks();
  const { data: categories } = useCategories();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);

  const filtered = useMemo(() => {
    return (items ?? []).filter((item) => {
      const matchesCategory = category === ALL || item.category === category;
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  if (isLoading) return <Spinner label="Chargement du menu…" />;

  const stockNames = (stocks ?? []).map((s) => s.name);
  const categoryNames = (categories ?? []).map((c) => c.name);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher un plat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option>{ALL}</option>
          {categoryNames.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Button
          className="ml-auto"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          <Plus size={18} /> {isAdmin ? 'Ajouter un plat au réseau' : 'Ajouter un Plat'}
        </Button>
      </div>

      {creating && (
        <Modal title={isAdmin ? 'Ajouter un plat au réseau' : 'Ajouter un Plat'} onClose={() => setCreating(false)}>
          <DishFormFields
            initial={EMPTY_DISH_FORM}
            stockNames={stockNames}
            categories={categoryNames}
            submitLabel="Créer l'article"
            onCancel={() => setCreating(false)}
            onDone={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Modifier le plat" onClose={() => setEditing(null)}>
          <DishFormFields
            itemId={editing.id}
            initial={{
              name: editing.name,
              description: editing.description,
              price_cents: editing.priceCents,
              category: editing.category,
              emoji: editing.emoji,
              available: editing.available,
              ingredients: editing.ingredients,
              image_data_url: editing.imageUrl,
            }}
            stockNames={stockNames}
            categories={categoryNames}
            submitLabel="Enregistrer"
            onCancel={() => setEditing(null)}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}

      {!items || items.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="Aucun plat"
          hint={isAdmin ? 'Ajoutez le premier plat commun au réseau.' : 'Ajoutez votre premier plat au menu.'}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Aucun résultat" hint="Essayez une autre recherche ou catégorie." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <DishCard key={item.id} item={item} isAdmin={isAdmin} onEdit={() => setEditing(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_DISH_FORM: MenuItemForm = {
  name: '',
  description: '',
  price_cents: 0,
  category: 'Burgers',
  emoji: '🍔',
  available: true,
  ingredients: [],
  image_data_url: '',
};

function DishCard({ item, isAdmin, onEdit }: { item: MenuItem; isAdmin: boolean; onEdit: () => void }) {
  const remove = useDeleteMenuItem();
  const toggle = useToggleMenuItem();
  // A franchisee may only hide/show a network default — never edit or delete it.
  const canEdit = isAdmin || !item.isGlobal;
  const visible = item.available && !item.hiddenForViewer;

  return (
    <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
      <div
        className="relative h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl || dishPhoto(item.name, item.category)})` }}
      >
        <span className="absolute right-3 top-3 flex gap-1.5">
          {!canEdit && (
            <Badge tone="yellow">
              <Lock size={11} className="mr-1" /> Par défaut
            </Badge>
          )}
          <Badge tone={visible ? 'green' : 'red'}>{visible ? 'Actif' : 'Masqué'}</Badge>
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-brand">{item.name}</h3>
          <span className="shrink-0 font-display font-extrabold text-brand">{formatPrice(item.priceCents)}</span>
        </div>
        <Badge tone="gray">{item.category}</Badge>
        <p className="mt-2 text-sm text-neutral-500">{item.description}</p>
        {item.ingredients.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.ingredients.map((ing) => (
              <span key={ing} className="rounded-full bg-brand-pale px-2 py-0.5 text-xs text-brand">
                {ing}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {canEdit && (
            <Button variant="ghost" onClick={onEdit} className="flex-1 py-2 text-sm">
              <Pencil size={15} /> Modifier
            </Button>
          )}
          <button
            onClick={() => toggle.mutate(item.id)}
            disabled={toggle.isPending}
            className={`grid h-10 shrink-0 place-items-center rounded-xl border border-brand/15 text-brand transition hover:bg-brand-pale ${
              canEdit ? 'w-10' : 'flex-1 gap-2 px-3 text-sm font-semibold'
            }`}
            aria-label={visible ? 'Masquer' : 'Afficher'}
            title={visible ? 'Masquer aux clients de mon restaurant' : 'Afficher aux clients de mon restaurant'}
          >
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
            {!canEdit && (visible ? 'Masquer' : 'Afficher')}
          </button>
          {canEdit && (
            <button
              onClick={() => remove.mutate(item.id)}
              disabled={remove.isPending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function DishFormFields({
  itemId,
  initial,
  stockNames,
  categories,
  submitLabel,
  onCancel,
  onDone,
}: {
  itemId?: string;
  initial: MenuItemForm;
  stockNames: string[];
  categories: string[];
  submitLabel: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const [form, setForm] = useState({
    ...initial,
    category: initial.category || categories[0] || '',
    priceEuros: (initial.price_cents / 100).toString(),
  });
  const pending = create.isPending || update.isPending;
  const error = (create.error ?? update.error) as Error | null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MenuItemForm = {
      name: form.name,
      description: form.description,
      price_cents: Math.round(parseFloat(form.priceEuros || '0') * 100),
      category: form.category,
      emoji: form.emoji || '🍽️',
      available: form.available,
      ingredients: form.ingredients,
      image_data_url: form.image_data_url,
    };
    const onSuccess = () => onDone();
    if (itemId) update.mutate({ id: itemId, form: payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-12">
        <ImageField
          value={form.image_data_url}
          onChange={(image_data_url) => setForm({ ...form, image_data_url })}
        />
      </div>
      <Input
        className="sm:col-span-4"
        placeholder="Nom du plat"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className="sm:col-span-2"
        placeholder="Emoji"
        value={form.emoji}
        onChange={(e) => setForm({ ...form, emoji: e.target.value })}
      />
      <select
        className="sm:col-span-3 rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <Input
        className="sm:col-span-3"
        type="number"
        step="0.01"
        min="0"
        placeholder="Prix (€)"
        required
        value={form.priceEuros}
        onChange={(e) => setForm({ ...form, priceEuros: e.target.value })}
      />
      <Input
        className="sm:col-span-12"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <div className="sm:col-span-9">
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Ingrédients {stockNames.length > 0 && <span className="font-normal text-neutral-400">(depuis votre stock)</span>}
        </label>
        <TagInput
          value={form.ingredients}
          onChange={(ingredients) => setForm({ ...form, ingredients })}
          suggestions={stockNames}
        />
      </div>

      <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-semibold text-neutral-600 sm:col-span-3">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        Visible (non masqué)
      </label>

      {error && (
        <p className="sm:col-span-12 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error.message}</p>
      )}
      <div className="flex gap-2 sm:col-span-12">
        <Button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

/** Free-text tag input with optional autocomplete suggestions (e.g. stock items). */
function TagInput({
  value,
  onChange,
  suggestions = [],
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState('');
  const listId = useMemo(() => `taginput-${Math.random().toString(36).slice(2)}`, []);

  const add = (raw: string) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };

  return (
    <div className="rounded-xl border border-brand/15 bg-white p-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-brand-pale px-2.5 py-1 text-xs font-semibold text-brand">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Retirer ${tag}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          list={listId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length === 0 ? 'Ajouter un ingrédient…' : ''}
          className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none"
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

/** Photo picker: file input + preview, compressed client-side before it's
 *  handed to the form as a data: URL (see utils/imageUpload). */
function ImageField({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await fileToCompressedDataUrl(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Photo</label>
      <div className="flex items-center gap-3">
        <div
          className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-brand/25 bg-neutral-50 bg-cover bg-center text-neutral-300"
          style={value ? { backgroundImage: `url(${value})`, borderStyle: 'solid' } : undefined}
        >
          {!value && <ImagePlus size={22} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1.5 text-sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? 'Traitement…' : value ? 'Changer la photo' : 'Choisir une photo'}
            </Button>
            {value && (
              <Button type="button" variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => onChange('')}>
                Retirer
              </Button>
            )}
          </div>
          <p className="text-xs text-neutral-400">JPEG/PNG, redimensionnée automatiquement. Facultatif.</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── Menus (plans) ───────────────

const EMPTY_PLAN_FORM: MenuPlanForm = {
  name: '',
  description: '',
  price_cents: 0,
  emoji: '🍽️',
  available: true,
  dish_ids: [],
  image_data_url: '',
};

function MenuPlansTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: plans, isLoading } = useMyMenuPlans();
  const { data: dishPool, isLoading: dishesLoading } = useDishPool(isAdmin);
  const [editing, setEditing] = useState<MenuPlan | null>(null);
  const [creating, setCreating] = useState(false);

  const dishById = useMemo(() => new Map((dishPool ?? []).map((d) => [d.id, d])), [dishPool]);

  if (isLoading || dishesLoading) return <Spinner label="Chargement des menus…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          <Plus size={18} /> {isAdmin ? 'Ajouter un menu au réseau' : 'Ajouter un Menu'}
        </Button>
      </div>

      {(!dishPool || dishPool.length === 0) && (
        <p className="rounded-xl bg-brand-pale px-4 py-3 text-sm text-brand">
          Créez d'abord quelques plats dans l'onglet <strong>Plats</strong> — un menu est une sélection de plats.
        </p>
      )}

      {creating && (
        <Modal title={isAdmin ? 'Ajouter un menu au réseau' : 'Ajouter un Menu'} onClose={() => setCreating(false)}>
          <PlanFormFields
            initial={EMPTY_PLAN_FORM}
            dishPool={dishPool ?? []}
            submitLabel="Créer le menu"
            onCancel={() => setCreating(false)}
            onDone={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Modifier le menu" onClose={() => setEditing(null)}>
          <PlanFormFields
            planId={editing.id}
            initial={{
              name: editing.name,
              description: editing.description,
              price_cents: editing.priceCents,
              emoji: editing.emoji,
              available: editing.available,
              dish_ids: editing.dishIds,
              image_data_url: editing.imageUrl,
            }}
            dishPool={dishPool ?? []}
            submitLabel="Enregistrer"
            onCancel={() => setEditing(null)}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}

      {!plans || plans.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucun menu"
          hint={isAdmin ? 'Composez le premier menu commun au réseau.' : 'Composez votre premier menu à partir de vos plats.'}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAdmin={isAdmin}
              dishById={dishById}
              onEdit={() => setEditing(plan)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  isAdmin,
  dishById,
  onEdit,
}: {
  plan: MenuPlan;
  isAdmin: boolean;
  dishById: Map<string, MenuItem>;
  onEdit: () => void;
}) {
  const remove = useDeleteMenuPlan();
  const toggle = useToggleMenuPlan();
  const canEdit = isAdmin || !plan.isGlobal;
  const visible = plan.available && !plan.hiddenForViewer;
  const firstDish = plan.dishIds.map((id) => dishById.get(id)).find(Boolean);
  const photo = plan.imageUrl || (firstDish ? dishPhoto(firstDish.name, firstDish.category) : dishPhoto(plan.name));

  return (
    <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
      <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }}>
        <span className="absolute right-3 top-3 flex gap-1.5">
          {!canEdit && (
            <Badge tone="yellow">
              <Lock size={11} className="mr-1" /> Par défaut
            </Badge>
          )}
          <Badge tone={visible ? 'green' : 'red'}>{visible ? 'Actif' : 'Masqué'}</Badge>
        </span>
        <span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-xl shadow-sm">
          {plan.emoji}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-brand">{plan.name}</h3>
          <span className="shrink-0 font-display font-extrabold text-brand">{formatPrice(plan.priceCents)}</span>
        </div>
        {plan.description && <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {plan.dishIds.map((id) => {
            const dish = dishById.get(id);
            return (
              <span key={id} className="rounded-full bg-brand-pale px-2 py-0.5 text-xs text-brand">
                {dish ? `${dish.emoji} ${dish.name}` : 'Plat inconnu'}
              </span>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          {canEdit && (
            <Button variant="ghost" onClick={onEdit} className="flex-1 py-2 text-sm">
              <Pencil size={15} /> Modifier
            </Button>
          )}
          <button
            onClick={() => toggle.mutate(plan.id)}
            disabled={toggle.isPending}
            className={`grid h-10 shrink-0 place-items-center rounded-xl border border-brand/15 text-brand transition hover:bg-brand-pale ${
              canEdit ? 'w-10' : 'flex-1 gap-2 px-3 text-sm font-semibold'
            }`}
            aria-label={visible ? 'Masquer' : 'Afficher'}
            title={visible ? 'Masquer aux clients de mon restaurant' : 'Afficher aux clients de mon restaurant'}
          >
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
            {!canEdit && (visible ? 'Masquer' : 'Afficher')}
          </button>
          {canEdit && (
            <button
              onClick={() => remove.mutate(plan.id)}
              disabled={remove.isPending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function PlanFormFields({
  planId,
  initial,
  dishPool,
  submitLabel,
  onCancel,
  onDone,
}: {
  planId?: string;
  initial: MenuPlanForm;
  dishPool: MenuItem[];
  submitLabel: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const create = useCreateMenuPlan();
  const update = useUpdateMenuPlan();
  const [form, setForm] = useState({ ...initial, priceEuros: (initial.price_cents / 100).toString() });
  const pending = create.isPending || update.isPending;
  const error = (create.error ?? update.error) as Error | null;

  const toggleDish = (id: string) => {
    setForm((f) => ({
      ...f,
      dish_ids: f.dish_ids.includes(id) ? f.dish_ids.filter((d) => d !== id) : [...f.dish_ids, id],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MenuPlanForm = {
      name: form.name,
      description: form.description,
      price_cents: Math.round(parseFloat(form.priceEuros || '0') * 100),
      emoji: form.emoji || '🍽️',
      available: form.available,
      dish_ids: form.dish_ids,
      image_data_url: form.image_data_url,
    };
    const onSuccess = () => onDone();
    if (planId) update.mutate({ id: planId, form: payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-12">
        <ImageField
          value={form.image_data_url}
          onChange={(image_data_url) => setForm({ ...form, image_data_url })}
        />
      </div>
      <Input
        className="sm:col-span-5"
        placeholder="Nom du menu (ex. Menu Burger)"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className="sm:col-span-2"
        placeholder="Emoji"
        value={form.emoji}
        onChange={(e) => setForm({ ...form, emoji: e.target.value })}
      />
      <Input
        className="sm:col-span-3"
        type="number"
        step="0.01"
        min="0"
        placeholder="Prix (€)"
        required
        value={form.priceEuros}
        onChange={(e) => setForm({ ...form, priceEuros: e.target.value })}
      />
      <label className="flex items-center gap-2 self-center text-sm font-semibold text-neutral-600 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        Visible
      </label>
      <Input
        className="sm:col-span-12"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <div className="sm:col-span-12">
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Plats inclus ({form.dish_ids.length} sélectionné{form.dish_ids.length > 1 ? 's' : ''})
        </label>
        {dishPool.length === 0 ? (
          <p className="text-sm text-neutral-400">Aucun plat disponible — créez-en d'abord dans l'onglet Plats.</p>
        ) : (
          <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-brand/15 p-3 sm:grid-cols-2">
            {dishPool.map((dish) => (
              <label
                key={dish.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${
                  form.dish_ids.includes(dish.id) ? 'bg-brand-pale text-brand' : 'hover:bg-neutral-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.dish_ids.includes(dish.id)}
                  onChange={() => toggleDish(dish.id)}
                />
                <span>{dish.emoji}</span>
                <span className="min-w-0 flex-1 truncate">{dish.name}</span>
                {dish.isGlobal && <Badge tone="yellow">Réseau</Badge>}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="sm:col-span-12 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error.message}</p>
      )}
      <div className="flex gap-2 sm:col-span-12">
        <Button type="submit" disabled={pending || form.dish_ids.length === 0}>
          {pending ? 'Enregistrement…' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
