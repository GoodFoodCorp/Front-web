import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, type BadgeTone } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { useAllRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { STAFF_PAGE_SIZE } from '../features/staff/api/staffApi';
import { useSetStaffAccess, useStaff } from '../features/staff/hooks/useStaff';
import type { StaffMember, StaffRole } from '../features/staff/types/staff.types';
import { useAuthStore } from '../store/authStore';
import { formatDateTime } from '../utils/format';

const ROLES: Record<StaffRole, { label: string; tone: BadgeTone }> = {
  user: { label: 'Client', tone: 'gray' },
  manager: { label: 'Gérant', tone: 'green' },
  livreur: { label: 'Livreur', tone: 'blue' },
  admin: { label: 'Siège', tone: 'yellow' },
};

function primaryRole(member: StaffMember): StaffRole {
  const slugs = member.roles.map((r) => r.slug);
  return (['admin', 'manager', 'livreur'] as const).find((r) => slugs.includes(r)) ?? 'user';
}

/** Head office: every account of the platform, and who manages what. */
export function AdminStaffPage() {
  const [page, setPage] = useState(1);
  const [typed, setTyped] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const { data, isLoading, isFetching } = useStaff(page, search);
  const { data: restaurants } = useAllRestaurants();

  // Searches once typing pauses, from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(typed.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [typed]);

  const restaurantName = (id: string | null) => restaurants?.find((r) => r.id === id)?.name ?? '—';
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / STAFF_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Personnel</h1>
        <p className="text-neutral-500">Comptes de la plateforme : rattachez un gérant à son restaurant, activez un livreur</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input className="pl-9" placeholder="Rechercher par email" value={typed} onChange={(e) => setTyped(e.target.value)} />
      </div>

      {isLoading ? (
        <Spinner label="Chargement des comptes…" />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon="👥" title="Aucun compte" hint={search ? 'Aucun email ne correspond à la recherche.' : undefined} />
      ) : (
        <div className={`overflow-x-auto rounded-2xl border border-brand/10 bg-white ${isFetching ? 'opacity-70' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand/10 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Restaurant</th>
                <th className="px-4 py-3">Inscrit le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((member) => {
                const role = primaryRole(member);
                return (
                  <tr key={member.id} className="border-b border-brand/5 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-neutral-800">{member.email}</span>
                      {!member.is_email_verified && <span className="ml-2 text-xs text-neutral-400">(non confirmé)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ROLES[role].tone}>{ROLES[role].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{role === 'manager' ? restaurantName(member.tenant_id) : '—'}</td>
                    <td className="px-4 py-3 text-neutral-500">{formatDateTime(member.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" onClick={() => setEditing(member)}>
                        Modifier
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-end gap-3 text-sm text-neutral-500">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          Page {page} / {pages}
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}

      {editing && <AccessForm member={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AccessForm({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const myId = useAuthStore((s) => s.userId);
  const { data: restaurants } = useAllRestaurants();
  const save = useSetStaffAccess();
  const [role, setRole] = useState<StaffRole>(primaryRole(member));
  const [restaurantId, setRestaurantId] = useState(member.tenant_id ?? '');
  const isMe = member.id === myId;

  return (
    <Modal title={member.email} maxWidth="max-w-md" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(
            { userId: member.id, role, restaurantId: role === 'manager' ? restaurantId : null },
            { onSuccess: onClose },
          );
        }}
      >
        <div>
          <label htmlFor="staff-role" className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Rôle
          </label>
          <Select
            id="staff-role"
            value={role}
            disabled={isMe}
            onChange={(v) => setRole(v as StaffRole)}
            options={(Object.keys(ROLES) as StaffRole[]).map((r) => ({ value: r, label: ROLES[r].label }))}
          />
          {isMe && <p className="mt-1 text-xs text-neutral-400">Vous ne pouvez pas modifier votre propre rôle.</p>}
        </div>
        {role === 'manager' && (
          <div>
            <label htmlFor="staff-restaurant" className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Restaurant
            </label>
            <Select
              id="staff-restaurant"
              value={restaurantId}
              onChange={setRestaurantId}
              placeholder="Choisir un restaurant"
              options={(restaurants ?? []).map((r) => ({ value: r.id, label: r.name, hint: r.city }))}
            />
          </div>
        )}
        <p className="text-xs text-neutral-400">
          Le compte est déconnecté de ses appareils : ses nouveaux droits s’appliquent à sa prochaine connexion.
        </p>
        {save.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(save.error as Error).message}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={save.isPending || isMe || (role === 'manager' && !restaurantId)}>
            {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
