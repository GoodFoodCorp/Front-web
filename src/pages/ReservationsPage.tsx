import { useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { ReservationStatusBadge } from '../features/reservations/components/ReservationStatusBadge';
import {
  useCancelMyReservation,
  useCreateReservation,
  useMyReservations,
} from '../features/reservations/hooks/useReservations';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { formatDateTime } from '../utils/format';

/** Customer view: book a table and follow your own reservations. */
export function ReservationsPage() {
  const { data: reservations, isLoading } = useMyReservations();
  const { data: restaurants } = useRestaurants();
  const create = useCreateReservation();
  const cancel = useCancelMyReservation();

  const [form, setForm] = useState({
    restaurantId: '',
    customerName: '',
    phone: '',
    partySize: 2,
    date: '',
    time: '19:30',
    notes: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        restaurantId: form.restaurantId,
        customerName: form.customerName,
        phone: form.phone,
        partySize: Number(form.partySize),
        reservationAt: new Date(`${form.date}T${form.time}:00`).toISOString(),
        notes: form.notes,
      },
      { onSuccess: () => setForm({ ...form, notes: '' }) },
    );
  };

  const canSubmit = form.restaurantId && form.customerName && form.date && !create.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div>
        <h1 className="mb-4 font-display text-2xl font-bold text-brand">Réserver une table</h1>
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Restaurant</label>
              <select
                value={form.restaurantId}
                onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                className="w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Choisir un restaurant…</option>
                {restaurants?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Nom</label>
              <Input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Marie Dupont"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Date</label>
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Heure</label>
                <Input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Couverts</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.partySize}
                  onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Téléphone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="06 01 02 03 04"
                />
              </div>
            </div>
            {create.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(create.error as Error).message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {create.isPending ? 'Réservation…' : 'Réserver'}
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-2xl font-bold text-brand">Mes réservations</h2>
        {isLoading ? (
          <Spinner />
        ) : !reservations || reservations.length === 0 ? (
          <EmptyState icon="🍽️" title="Aucune réservation" hint="Réservez votre première table." />
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const restaurant = restaurants?.find((x) => x.id === r.restaurantId);
              const cancellable = r.status === 'PENDING' || r.status === 'CONFIRMED';
              return (
                <Card key={r._id} className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-brand">
                        {restaurant?.name ?? 'Restaurant'}
                      </span>
                      <ReservationStatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} /> {formatDateTime(r.reservationAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {r.partySize}
                      </span>
                    </p>
                  </div>
                  {cancellable && (
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5"
                      disabled={cancel.isPending}
                      onClick={() => cancel.mutate(r._id)}
                    >
                      Annuler
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
