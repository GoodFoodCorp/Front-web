import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRestaurants } from '../../features/restaurants/hooks/useRestaurants';

/**
 * Mirrors the "Emplacement" selector in the back-office mockups. A
 * franchisee's JWT scopes them to a single restaurant (tenant_id), so this
 * is a read-only display rather than an actual switcher — there is nothing
 * else to switch to under the current auth model.
 */
export function LocationBadge() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.find((r) => r.id === tenantId);

  return (
    <div className="text-right">
      <p className="mb-1 text-xs font-semibold text-neutral-400">Emplacement</p>
      <div className="flex items-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-2 text-sm font-semibold text-brand">
        {restaurant?.name ?? '—'}
        <ChevronDown size={14} className="text-neutral-400" />
      </div>
    </div>
  );
}
