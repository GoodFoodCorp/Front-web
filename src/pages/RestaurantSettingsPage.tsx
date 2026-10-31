import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Spinner } from '../components/Spinner';
import { Switch } from '../components/Switch';
import { useAuthStore } from '../store/authStore';
import { useRestaurant, useSetOrderIntake, useUpdateOperations } from '../features/restaurants/hooks/useRestaurants';
import type { OpeningSlot, OperationsForm } from '../features/restaurants/types/restaurant.types';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
/** Monday first, as French schedules read. */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const inputClass = 'rounded-xl border border-brand/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand';

/**
 * Franchisee settings that drive ordering: opening hours (in the restaurant's
 * time zone), order intake pause, delivery zone, fee and minimum, kitchen
 * pace and dining room size.
 */
export function RestaurantSettingsPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: restaurant, isLoading } = useRestaurant(tenantId ?? undefined);
  const update = useUpdateOperations();
  const intake = useSetOrderIntake();
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

  const setSlot = (index: number, patch: Partial<OpeningSlot>) =>
    setForm({ ...form, openingHours: form.openingHours.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ id: restaurant.id, form });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand">Réglages du restaurant</h1>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-brand">Prise de commandes</p>
          <p className="text-sm text-neutral-500">
            {restaurant.acceptingOrders ? 'Les clients peuvent commander.' : 'Commandes suspendues (coup de feu, incident…).'}{' '}
            {restaurant.isOpenNow ? 'Ouvert actuellement.' : 'Fermé actuellement.'}
          </p>
        </div>
        <Switch
          label="Prendre des commandes"
          checked={restaurant.acceptingOrders ?? true}
          onChange={(accepting: boolean) => intake.mutate({ id: restaurant.id, acceptingOrders: accepting })}
        />
      </Card>

      <form onSubmit={save} className="space-y-6">
        <Card className="space-y-3">
          <p className="font-display font-bold text-brand">Horaires d'ouverture</p>
          <p className="text-xs text-neutral-400">Heure locale du restaurant ({form.timeZone}). Sans horaire, le restaurant est considéré ouvert.</p>
          {form.openingHours.map((slot, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Select
                aria-label="Jour"
                className="w-40"
                value={String(slot.day)}
                onChange={(v) => setSlot(i, { day: Number(v) })}
                options={DAY_ORDER.map((d) => ({ value: String(d), label: DAYS[d] }))}
              />
              <input type="time" aria-label={`Ouverture (${DAYS[slot.day]})`} value={slot.opens} onChange={(e) => setSlot(i, { opens: e.target.value })} className={inputClass} />
              <span className="text-sm text-neutral-400">à</span>
              <input type="time" aria-label={`Fermeture (${DAYS[slot.day]})`} value={slot.closes} onChange={(e) => setSlot(i, { closes: e.target.value })} className={inputClass} />
              <button
                type="button"
                onClick={() => setForm({ ...form, openingHours: form.openingHours.filter((_, j) => j !== i) })}
                className="text-sm text-red-500"
              >
                Retirer
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setForm({ ...form, openingHours: [...form.openingHours, { day: 1, opens: '11:30', closes: '14:30' }] })}
          >
            Ajouter une plage
          </Button>
        </Card>

        <Card className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Rayon de livraison (km)" value={form.deliveryRadiusKm} step={0.5} onChange={(v) => setForm({ ...form, deliveryRadiusKm: v })} />
          <NumberField label="Frais de livraison (€)" value={form.deliveryFeeCents / 100} step={0.1} onChange={(v) => setForm({ ...form, deliveryFeeCents: Math.round(v * 100) })} />
          <NumberField label="Minimum de commande (€)" value={form.minimumOrderCents / 100} step={1} onChange={(v) => setForm({ ...form, minimumOrderCents: Math.round(v * 100) })} />
          <NumberField label="Temps de préparation (min)" value={form.prepTimeMinutes} step={1} onChange={(v) => setForm({ ...form, prepTimeMinutes: v })} />
          <NumberField label="Couverts par créneau" value={form.seatingCapacity} step={1} onChange={(v) => setForm({ ...form, seatingCapacity: v })} />
          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Téléphone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </label>
        </Card>

        {update.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(update.error as Error).message}</p>}
        {update.isSuccess && <p className="text-sm text-brand">Réglages enregistrés.</p>}
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </div>
  );
}

function NumberField({ label, value, step, onChange }: { label: string; value: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
      {label}
      <input type="number" min={0} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />
    </label>
  );
}
