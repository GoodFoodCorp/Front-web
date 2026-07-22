import { CalendarDays, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { ReservationStatusBadge } from '../features/reservations/components/ReservationStatusBadge';
import {
  useRestaurantReservations,
  useUpdateReservationStatus,
} from '../features/reservations/hooks/useReservations';
import type { Reservation, ReservationStatus } from '../features/reservations/types/reservation.types';
import { formatDateTime } from '../utils/format';

/** Actions the restaurant can trigger for each status. */
const ACTIONS: Partial<Record<ReservationStatus, { status: ReservationStatus; label: string }[]>> = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Confirmer' },
    { status: 'CANCELLED', label: 'Refuser' },
  ],
  CONFIRMED: [
    { status: 'SEATED', label: 'Installer' },
    { status: 'NO_SHOW', label: 'Non honorée' },
    { status: 'CANCELLED', label: 'Annuler' },
  ],
};

export function PortalReservationsPage() {
  const { data: reservations, isLoading } = useRestaurantReservations();

  if (isLoading) return <Spinner label="Chargement des réservations…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Réservations</h1>
        <p className="text-neutral-500">Les réservations de votre restaurant</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <EmptyState icon="📅" title="Aucune réservation" hint="Les réservations clients apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <ReservationRow key={r._id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
  const update = useUpdateReservationStatus();
  const actions = ACTIONS[reservation.status] ?? [];

  return (
    <Card className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-brand">{reservation.customerName}</span>
          <ReservationStatusBadge status={reservation.status} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} /> {formatDateTime(reservation.reservationAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {reservation.partySize} couverts
          </span>
          {reservation.phone && <span>{reservation.phone}</span>}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a.status}
            variant={a.status === 'CANCELLED' || a.status === 'NO_SHOW' ? 'ghost' : 'primary'}
            className="px-3 py-1.5"
            disabled={update.isPending}
            onClick={() => update.mutate({ id: reservation._id, status: a.status })}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
