import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, PackageCheck, Truck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useLogout } from '../features/auth/hooks/useAuth';
import { DeliveryStatusBadge } from '../features/delivery/components/DeliveryStatusBadge';
import {
  useAcceptDelivery,
  useAvailableDeliveries,
  useDropoffDelivery,
  useMyDeliveries,
  usePickupDelivery,
} from '../features/delivery/hooks/useDelivery';
import type { Delivery } from '../features/delivery/types/delivery.types';
import { formatPrice } from '../utils/format';
import logo from '../assets/logo.svg';

/**
 * Web courier console (the mobile app is the main courier client): claim an
 * available delivery, collect the meal, hand it over.
 */
export function CourierPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: mine, isLoading: loadingMine } = useMyDeliveries();
  const { data: available, isLoading: loadingAvailable } = useAvailableDeliveries();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between bg-brand px-6 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Good Food" className="h-9 w-9" />
          <div>
            <p className="font-display font-extrabold leading-tight">Good Food</p>
            <p className="text-xs text-white/60">Espace livreur</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-6">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-brand">Mes courses en cours</h2>
          {loadingMine ? (
            <Spinner label="Chargement…" />
          ) : !mine || mine.length === 0 ? (
            <EmptyState icon="🛵" title="Aucune course en cours" hint="Acceptez une course ci-dessous." />
          ) : (
            <div className="space-y-3">
              {mine.map((delivery) => (
                <MyDeliveryCard key={delivery._id} delivery={delivery} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-brand">Courses disponibles</h2>
          {loadingAvailable ? (
            <Spinner label="Recherche de courses…" />
          ) : !available || available.length === 0 ? (
            <EmptyState
              icon="📭"
              title="Aucune course pour le moment"
              hint="Les commandes en préparation ou prêtes apparaissent automatiquement."
            />
          ) : (
            <div className="space-y-3">
              {available.map((delivery) => (
                <AvailableDeliveryCard key={delivery._id} delivery={delivery} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Route({ delivery }: { delivery: Delivery }) {
  return (
    <div className="space-y-1.5 text-sm text-neutral-600">
      <p className="flex items-center gap-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-pale text-[10px] font-bold text-brand">
          R
        </span>
        {delivery.pickup.address}
      </p>
      <p className="flex items-center gap-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/40 text-[10px] font-bold text-brand-dark">
          C
        </span>
        {delivery.dropoff.address}
      </p>
    </div>
  );
}

function AvailableDeliveryCard({ delivery }: { delivery: Delivery }) {
  const accept = useAcceptDelivery();

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display font-bold text-brand">Commande #{delivery.orderId.slice(0, 8)}</p>
        {delivery.courierFeeCents != null && (
          <span className="font-display font-extrabold text-brand">{formatPrice(delivery.courierFeeCents)}</span>
        )}
      </div>
      <Route delivery={delivery} />
      <Button disabled={accept.isPending} onClick={() => accept.mutate(delivery._id)}>
        <CheckCircle2 size={16} /> Accepter
      </Button>
      {accept.isError && <p className="text-sm text-red-600">{(accept.error as Error).message}</p>}
    </Card>
  );
}

function MyDeliveryCard({ delivery }: { delivery: Delivery }) {
  const pickup = usePickupDelivery();
  const dropoff = useDropoffDelivery();
  const error = (pickup.error ?? dropoff.error) as Error | null;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display font-bold text-brand">Commande #{delivery.orderId.slice(0, 8)}</p>
        <DeliveryStatusBadge status={delivery.status} />
      </div>
      <Route delivery={delivery} />

      {delivery.status === 'ASSIGNED' && (
        <Button disabled={pickup.isPending} onClick={() => pickup.mutate(delivery._id)}>
          <PackageCheck size={16} /> J'ai récupéré la commande
        </Button>
      )}
      {(delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') && (
        <Button disabled={dropoff.isPending} onClick={() => dropoff.mutate(delivery._id)}>
          <Truck size={16} /> Commande livrée
        </Button>
      )}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </Card>
  );
}
