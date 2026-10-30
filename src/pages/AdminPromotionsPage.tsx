import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Percent, Plus, Tag, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import {
  useCreatePromoCode,
  useDeletePromoCode,
  usePromoCodes,
  useUpdatePromoCode,
} from '../features/promos/hooks/usePromos';
import type { PromoCode, PromoCodeForm } from '../features/promos/types/promo.types';
import { formatPrice } from '../utils/format';

const EMPTY_FORM: PromoCodeForm = {
  code: '',
  percent_off: 10,
  min_order_amount_cents: 0,
  max_redemptions: null,
  is_active: true,
  once_per_customer: false,
};

export function AdminPromotionsPage() {
  const { data: promos, isLoading } = usePromoCodes();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const remove = useDeletePromoCode();

  const stats = useMemo(() => {
    const total = promos?.length ?? 0;
    const active = promos?.filter((p) => p.is_active).length ?? 0;
    const redemptions = (promos ?? []).reduce((sum, p) => sum + p.redemptions_used, 0);
    return { total, active, redemptions };
  }, [promos]);

  if (isLoading) return <Spinner label="Chargement des codes promo…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Promotions</h1>
        <p className="text-neutral-500">Campagnes promotionnelles du réseau (siège uniquement)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Codes créés" value={String(stats.total)} />
        <StatCard label="Codes actifs" value={String(stats.active)} />
        <StatCard label="Utilisations totales" value={String(stats.redemptions)} />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus size={18} /> Créer un code promo
        </Button>
      </div>

      {creating && (
        <Modal title="Créer un code promo" onClose={() => setCreating(false)} maxWidth="max-w-xl">
          <PromoForm onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title={`Modifier · ${editing.code}`} onClose={() => setEditing(null)} maxWidth="max-w-xl">
          <PromoForm promo={editing} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {!promos || promos.length === 0 ? (
        <EmptyState icon="🏷️" title="Aucun code promo" hint="Créez votre premier code promo réseau." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-brand/10 bg-neutral-50 text-left text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Remise</th>
                <th className="px-5 py-3">Min. commande</th>
                <th className="px-5 py-3">Utilisations</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand/10">
              {promos.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-display font-bold text-brand">
                      <span className="inline-flex items-center gap-1.5">
                        <Tag size={14} /> {p.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-brand">
                        <Percent size={13} /> {p.percent_off}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-500">
                      {p.min_order_amount_cents > 0 ? formatPrice(p.min_order_amount_cents) : '—'}
                    </td>
                    <td className="px-5 py-3 text-neutral-500">
                      {p.redemptions_used}
                      {p.max_redemptions != null ? ` / ${p.max_redemptions}` : ''}
                      {p.once_per_customer && <span className="block text-xs">1 par client</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setEditing(p)} className="px-3 py-1.5 text-xs">
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={p.redemptions_used > 0 || remove.isPending}
                          title={p.redemptions_used > 0 ? 'Un code déjà utilisé ne peut pas être supprimé' : undefined}
                          onClick={() => remove.mutate(p.id)}
                          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-brand">{value}</p>
    </div>
  );
}

function PromoForm({
  promo,
  onDone,
  onCancel,
}: {
  promo?: PromoCode;
  onDone: () => void;
  onCancel: () => void;
}) {
  const create = useCreatePromoCode();
  const update = useUpdatePromoCode();
  const pending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const [form, setForm] = useState<PromoCodeForm>(
    promo
      ? {
          code: promo.code,
          percent_off: promo.percent_off,
          min_order_amount_cents: promo.min_order_amount_cents,
          max_redemptions: promo.max_redemptions,
          expires_at: promo.expires_at,
          is_active: promo.is_active,
          once_per_customer: promo.once_per_customer,
        }
      : EMPTY_FORM,
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (promo) {
      update.mutate({ id: promo.id, form }, { onSuccess: onDone });
    } else {
      create.mutate(form, { onSuccess: onDone });
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Code</span>
        <Input
          placeholder="ex. WELCOME10"
          required
          autoFocus={!promo}
          disabled={!!promo}
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Remise (%)</span>
        <Input
          type="number"
          min={1}
          max={100}
          required
          value={form.percent_off}
          onChange={(e) => setForm({ ...form, percent_off: Number(e.target.value) })}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Commande minimale (centimes)</span>
        <Input
          type="number"
          min={0}
          value={form.min_order_amount_cents}
          onChange={(e) => setForm({ ...form, min_order_amount_cents: Number(e.target.value) })}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Plafond d'utilisations</span>
        <Input
          type="number"
          min={1}
          placeholder="vide = illimité"
          value={form.max_redemptions ?? ''}
          onChange={(e) => setForm({ ...form, max_redemptions: e.target.value ? Number(e.target.value) : null })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        Code actif
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.once_per_customer}
          onChange={(e) => setForm({ ...form, once_per_customer: e.target.checked })}
        />
        Une seule utilisation par client (offre de bienvenue)
      </label>
      {error && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(error as Error).message}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : promo ? 'Enregistrer' : 'Créer le code promo'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
