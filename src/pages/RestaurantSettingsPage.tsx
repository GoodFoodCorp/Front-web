import { useEffect, useState } from 'react';
import { Copy, Plus, Power, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Switch } from '../components/Switch';
import { useAuthStore } from '../store/authStore';
import { useRestaurant, useSetOrderIntake, useUpdateOperations } from '../features/restaurants/hooks/useRestaurants';
import { DAY_NAMES, DAY_ORDER, openingLabel } from '../features/restaurants/openingHours';
import type { OpeningSlot, OperationsForm, Restaurant } from '../features/restaurants/types/restaurant.types';

const inputClass = 'rounded-xl border border-brand/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand';

/** A day switched on starts with this period. */
const DEFAULT_PERIOD = { opens: '11:00', closes: '23:00' };
/** A second period of the day (lunch then dinner). */
const EVENING_PERIOD = { opens: '19:00', closes: '22:30' };

/**
 * Franchisee settings that drive ordering: whether the restaurant is open
 * (temporary closing), its weekly hours (in its time zone), delivery zone,
 * fee and minimum, kitchen pace and dining room size.
 */
export function RestaurantSettingsPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: restaurant, isLoading } = useRestaurant(tenantId ?? undefined);
  const update = useUpdateOperations();
  const [form, setForm] = useState<OperationsForm | null>(null);

  useEffect(() => {
    if (!restaurant || form) return;
    setForm({
      phone: restaurant.phone ?? '',
      timeZone: restaurant.timeZone ?? 'Europe/Paris',
      openingHours: restaurant.openingHours ?? [],
      prepTimeMinutes: restaurant.prepTimeMinutes ?? 20,
      deliveryRadiusKm: restaurant.deliveryRadiusKm ?? 5,
      deliveryFeeCents: restaurant.deliveryFeeCents ?? 299,
      minimumOrderCents: restaurant.minimumOrderCents ?? 0,
      seatingCapacity: restaurant.seatingCapacity ?? 40,
    });
  }, [restaurant, form]);

  if (isLoading || !restaurant || !form) return <Spinner />;

  const setHours = (openingHours: OpeningSlot[]) => {
    update.reset();
    setForm({ ...form, openingHours });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ id: restaurant.id, form });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand">Réglages du restaurant</h1>

      <OpeningCard restaurant={restaurant} />

      <form onSubmit={save} className="space-y-6">
        <Card className="space-y-4">
          <div>
            <p className="font-display font-bold text-brand">Horaires d’ouverture</p>
            <p className="text-sm text-neutral-500">
              En dehors de ces horaires, les clients voient le restaurant fermé et ne peuvent pas commander. Heure
              locale ({form.timeZone}).
            </p>
          </div>
          <WeekEditor hours={form.openingHours} onChange={setHours} />
          {form.openingHours.length === 0 && (
            <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Aucun jour d’ouverture : le restaurant apparaîtra fermé tant que vous n’aurez pas ouvert au moins un jour.
            </p>
          )}
        </Card>

        <Card className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Rayon de livraison (km)" value={form.deliveryRadiusKm} step="any" onChange={(v) => setForm({ ...form, deliveryRadiusKm: v })} />
          <NumberField label="Frais de livraison (€)" value={form.deliveryFeeCents / 100} step={0.01} onChange={(v) => setForm({ ...form, deliveryFeeCents: Math.round(v * 100) })} />
          <NumberField label="Minimum de commande (€)" value={form.minimumOrderCents / 100} step={0.01} onChange={(v) => setForm({ ...form, minimumOrderCents: Math.round(v * 100) })} />
          <NumberField label="Temps de préparation (min)" value={form.prepTimeMinutes} step={1} onChange={(v) => setForm({ ...form, prepTimeMinutes: v })} />
          <NumberField label="Couverts par créneau" value={form.seatingCapacity} step={1} onChange={(v) => setForm({ ...form, seatingCapacity: v })} />
          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Téléphone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </label>
        </Card>

        {update.isError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {(update.error as Error).message}
          </p>
        )}
        {update.isSuccess && (
          <p role="status" className="text-sm text-brand">
            Réglages enregistrés.
          </p>
        )}
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </div>
  );
}

/** What customers see right now, and the button to close or reopen at once. */
function OpeningCard({ restaurant }: { restaurant: Restaurant }) {
  const intake = useSetOrderIntake();
  const opening = openingLabel(restaurant);
  const closedByUs = restaurant.acceptingOrders === false;
  const toggle = () => intake.mutate({ id: restaurant.id, acceptingOrders: closedByUs });

  return (
    <Card className={`space-y-3 ${closedByUs ? 'border-amber-300 bg-amber-50' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`h-3 w-3 shrink-0 rounded-full ${opening.open ? 'bg-green-500' : closedByUs ? 'bg-amber-500' : 'bg-neutral-400'}`}
          />
          <div>
            <p className="font-display text-lg font-bold text-brand">
              {opening.badge}
              {opening.detail && <span className="font-sans text-base font-semibold text-neutral-600"> · {opening.detail}</span>}
            </p>
            <p className="text-sm text-neutral-600">
              {closedByUs
                ? 'Les clients voient « Fermé temporairement » et ne peuvent pas commander, quels que soient vos horaires.'
                : opening.open
                  ? 'Les clients peuvent commander. Fermez temporairement en cas de rush, d’incident ou de fermeture exceptionnelle.'
                  : 'Les clients voient le restaurant fermé : il rouvrira automatiquement selon vos horaires.'}
            </p>
          </div>
        </div>
        <Button
          variant={closedByUs ? 'primary' : 'ghost'}
          onClick={toggle}
          disabled={intake.isPending}
          className={closedByUs ? '' : 'border-red-200 text-red-600 hover:bg-red-50'}
        >
          <Power size={16} aria-hidden />
          {intake.isPending ? 'Un instant…' : closedByUs ? 'Rouvrir le restaurant' : 'Fermer temporairement'}
        </Button>
      </div>
      {intake.isError && (
        <p role="alert" className="text-sm text-red-600">
          {(intake.error as Error).message}
        </p>
      )}
    </Card>
  );
}

/** One line per day, Monday first: closed, or one or more periods. */
function WeekEditor({ hours, onChange }: { hours: OpeningSlot[]; onChange: (hours: OpeningSlot[]) => void }) {
  const ofDay = (day: number) => hours.filter((s) => s.day === day).sort((a, b) => a.opens.localeCompare(b.opens));
  const replaceDay = (day: number, periods: { opens: string; closes: string }[]) =>
    onChange([...hours.filter((s) => s.day !== day), ...periods.map((p) => ({ day, ...p }))]);
  const monday = ofDay(1);

  return (
    <div className="space-y-2">
      {DAY_ORDER.map((day) => {
        const periods = ofDay(day);
        const open = periods.length > 0;
        return (
          <div key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-brand/10 px-3 py-2.5">
            <div className="flex w-40 items-center gap-3">
              <Switch
                label={`${DAY_NAMES[day]} : ${open ? 'ouvert' : 'fermé'}`}
                checked={open}
                onChange={(on) => replaceDay(day, on ? [DEFAULT_PERIOD] : [])}
              />
              <span className="text-sm font-semibold text-neutral-700">{DAY_NAMES[day]}</span>
            </div>
            {open ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {periods.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <input
                      type="time"
                      aria-label={`${DAY_NAMES[day]}, ouverture ${i + 1}`}
                      value={p.opens}
                      onChange={(e) => replaceDay(day, periods.map((q, j) => (j === i ? { ...q, opens: e.target.value } : q)))}
                      className={inputClass}
                    />
                    <span className="text-sm text-neutral-400">–</span>
                    <input
                      type="time"
                      aria-label={`${DAY_NAMES[day]}, fermeture ${i + 1}`}
                      value={p.closes}
                      onChange={(e) => replaceDay(day, periods.map((q, j) => (j === i ? { ...q, closes: e.target.value } : q)))}
                      className={inputClass}
                    />
                    {periods.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Retirer cette plage du ${DAY_NAMES[day].toLowerCase()}`}
                        onClick={() => replaceDay(day, periods.filter((_, j) => j !== i))}
                        className="rounded-full p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </span>
                ))}
                {periods.length < 3 && (
                  <button
                    type="button"
                    onClick={() => replaceDay(day, [...periods, EVENING_PERIOD])}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                  >
                    <Plus size={14} aria-hidden /> Plage
                  </button>
                )}
              </div>
            ) : (
              <span className="text-sm text-neutral-400">Fermé</span>
            )}
          </div>
        );
      })}
      {monday.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            onChange(DAY_ORDER.flatMap((day) => monday.map((p) => ({ day, opens: p.opens, closes: p.closes }))))
          }
        >
          <Copy size={15} aria-hidden /> Appliquer les horaires du lundi à toute la semaine
        </Button>
      )}
    </div>
  );
}

/** step: 0.01 for euros (2,99 €), "any" for a distance — a value off the step would block the whole form. */
function NumberField({ label, value, step, onChange }: { label: string; value: number; step: number | 'any'; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
      {label}
      <input type="number" min={0} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />
    </label>
  );
}
