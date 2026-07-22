import { Sparkles } from 'lucide-react';
import { Badge, type BadgeTone } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import {
  useReplenishments,
  useStocks,
  useUpdateReplenishmentStatus,
} from '../features/stock/hooks/useStock';
import { useAuthStore } from '../store/authStore';
import type { ReplenishmentRequest, ReplenishmentStatus } from '../features/stock/types/stock.types';

const STATUS_META: Record<ReplenishmentStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'En attente', tone: 'yellow' },
  APPROVED: { label: 'Approuvée', tone: 'blue' },
  ORDERED: { label: 'Commandée', tone: 'blue' },
  RECEIVED: { label: 'Reçue', tone: 'green' },
  CANCELLED: { label: 'Annulée', tone: 'red' },
};

// Only head office (admin) may advance a request; managers get a read-only view.
const NEXT_STATUS: Partial<Record<ReplenishmentStatus, string>> = {
  PENDING: 'APPROVED',
  APPROVED: 'ORDERED',
  ORDERED: 'RECEIVED',
};

export function ReplenishmentsPage() {
  const { data: requests, isLoading } = useReplenishments();
  const { data: stocks } = useStocks();
  const isAdmin = useAuthStore((s) => s.roles.includes('admin'));

  if (isLoading) return <Spinner label="Chargement des demandes…" />;

  const itemName = (id: string) => stocks?.find((s) => s.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Réapprovisionnement</h1>
        <p className="text-neutral-500">
          Demandes de réappro — les demandes automatiques sont générées sous le seuil minimum
        </p>
      </div>

      {!requests || requests.length === 0 ? (
        <EmptyState icon="🚚" title="Aucune demande" hint="Les demandes apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestRow key={req.id} req={req} itemName={itemName(req.stockItemId)} canAct={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestRow({
  req,
  itemName,
  canAct,
}: {
  req: ReplenishmentRequest;
  itemName: string;
  canAct: boolean;
}) {
  const update = useUpdateReplenishmentStatus();
  const meta = STATUS_META[req.status];
  const next = NEXT_STATUS[req.status];

  return (
    <Card className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-brand">{itemName}</span>
          {req.isAutomatic && (
            <Badge tone="yellow">
              <Sparkles size={11} className="mr-1" /> Auto
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">
          Quantité demandée : <span className="font-semibold">{req.quantityRequested}</span> ·{' '}
          {new Date(req.requestedAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      <Badge tone={meta.tone}>{meta.label}</Badge>

      {canAct && next && (
        <Button
          variant="ghost"
          className="px-3 py-1.5"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: req.id, status: next })}
        >
          → {STATUS_META[next as ReplenishmentStatus].label}
        </Button>
      )}
      {canAct && req.status === 'PENDING' && (
        <Button
          variant="danger"
          className="px-3 py-1.5"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: req.id, status: 'CANCELLED' })}
        >
          Annuler
        </Button>
      )}
    </Card>
  );
}
