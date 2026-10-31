import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../Card';
import { LEGAL } from '../../config/legal';

export interface LegalSection {
  id?: string;
  title: string;
  body: ReactNode;
}

/** Layout shared by the legal pages: title, date, a table of contents and the sections. */
export function LegalPage({ title, intro, sections }: { title: string; intro?: ReactNode; sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} aria-hidden /> Retour à l’accueil
      </Link>

      <header>
        <h1 className="font-display text-3xl font-bold text-brand">{title}</h1>
        <p className="mt-1 text-sm text-neutral-400">Dernière mise à jour : {LEGAL.updatedAt}</p>
        {intro && <div className="mt-4 text-sm leading-relaxed text-neutral-600">{intro}</div>}
      </header>

      <nav aria-label="Sommaire" className="rounded-2xl border border-brand/10 bg-white p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Sommaire</p>
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.title}>
              <a href={`#${s.id ?? `s${i + 1}`}`} className="text-brand hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Card className="space-y-6">
        {sections.map((s, i) => (
          <section key={s.title} id={s.id ?? `s${i + 1}`} className="scroll-mt-24">
            <h2 className="font-display text-lg font-bold text-brand">{s.title}</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600 [&_li]:ml-5 [&_li]:list-disc">
              {s.body}
            </div>
          </section>
        ))}
      </Card>
    </div>
  );
}
