import { useState } from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useMarkPayoutPaid, usePayouts } from '../features/payouts/hooks/usePayouts';
import type { Payout, PayoutStatus } from '../features/payouts/types/payout.types';
import { formatDateTime, formatPrice } from '../utils/format';

/** Head office: courier withdrawal requests, to pay by bank transfer. */
export function AdminPayoutsPage() {
  const [status, setStatus] = useState<PayoutStatus>('PENDING');
  const { data: payouts, isLoading } = usePayouts(status);
  const total = (payouts ?? []).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Paiements livreurs</h1>
          <p className="text-neutral-500">Virez le montant sur l’IBAN indiqué, puis marquez la demande comme payée</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {(['PENDING', 'PAID'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${status === s ? 'bg-brand text-white' : 'text-neutral-500 hover:text-brand'}`}
            >
              {s === 'PENDING' ? 'À payer' : 'Payées'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Chargement des demandes…" />
      ) : !payouts || payouts.length === 0 ? (
        <EmptyState icon="💸" title={status === 'PENDING' ? 'Aucune demande à payer' : 'Aucun paiement enregistré'} />
      ) : (
        <>
          <p className="text-sm text-neutral-500">
            {payouts.length} demande(s) · {formatPrice(Math.round(total * 100))}
          </p>
          <div className="space-y-3">
            {payouts.map((p) => (
              <PayoutRow key={p.id} payout={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PayoutRow({ payout }: { payout: Payout }) {
  const markPaid = useMarkPayoutPaid();
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand/10 bg-white p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-extrabold text-brand">{formatPrice(Math.round(payout.amount * 100))}</span>
          <Badge tone={payout.status === 'PAID' ? 'green' : 'yellow'}>{payout.status === 'PAID' ? 'Payée' : 'À payer'}</Badge>
        </div>
        <p className="mt-1 font-mono text-sm text-neutral-700">{payout.iban || payout.ibanMasked}</p>
        <p className="mt-0.5 text-xs text-neutral-400">
          Livreur {payout.livreurId.slice(0, 8)} · demandé le {formatDateTime(payout.requestedAt)}
          {payout.paidAt && ` · payé le ${formatDateTime(payout.paidAt)}`}
        </p>
        {markPaid.isError && <p className="mt-1 text-sm text-red-600">{(markPaid.error as Error).message}</p>}
      </div>
      {payout.status === 'PENDING' && (
        <Button disabled={markPaid.isPending} onClick={() => markPaid.mutate(payout.id)}>
          Marquer comme payée
        </Button>
      )}
    </div>
  );
}
