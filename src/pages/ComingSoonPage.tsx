import { Construction } from 'lucide-react';

/** Placeholder for portal sections that exist in the design but have no
 *  backend support yet — shown instead of a broken or silently missing page. */
export function ComingSoonPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">{title}</h1>
        {subtitle && <p className="text-neutral-500">{subtitle}</p>}
      </div>
      <div className="grid place-items-center rounded-2xl border border-dashed border-brand/20 bg-white py-20 text-center">
        <Construction size={32} className="text-neutral-300" />
        <p className="mt-3 font-display font-bold text-brand">Bientôt disponible</p>
        <p className="mt-1 max-w-sm text-sm text-neutral-400">
          Cette section n'est pas encore raccordée à un service — l'interface arrive avant le backend.
        </p>
      </div>
    </div>
  );
}
