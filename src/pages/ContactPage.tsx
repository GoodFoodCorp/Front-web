import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Card } from '../components/Card';

const CONTACT_EMAIL = 'contact@goodfood.fr';
const CONTACT_PHONE = '+33 1 23 45 67 89';

const CHANNELS = [
  {
    icon: Mail,
    title: 'Par email',
    detail: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: Phone,
    title: 'Par téléphone',
    detail: CONTACT_PHONE,
    href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}`,
  },
  {
    icon: MapPin,
    title: 'Siège social',
    detail: '12 rue de la République, 75011 Paris',
    href: undefined,
  },
  {
    icon: Clock,
    title: 'Horaires du support',
    detail: 'Du lundi au samedi, 9h — 22h',
    href: undefined,
  },
];

export function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="brand-texture overflow-hidden rounded-3xl bg-brand px-8 py-10 text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Contactez-nous</h1>
        <p className="mt-2 max-w-xl text-white/70">
          Une question sur une commande, un restaurant ou un partenariat ? Notre équipe vous répond
          rapidement.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {CHANNELS.map((c) => {
          const content = (
            <>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-pale text-brand">
                <c.icon size={19} />
              </div>
              <div>
                <p className="font-display font-bold text-brand">{c.title}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{c.detail}</p>
              </div>
            </>
          );
          return c.href ? (
            <a key={c.title} href={c.href} className="flex items-center gap-4 rounded-2xl border border-brand/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
              {content}
            </a>
          ) : (
            <Card key={c.title} className="flex items-center gap-4">
              {content}
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="font-display text-lg font-bold text-brand">Besoin d'aide sur une commande ?</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Consultez d'abord notre{' '}
          <Link to="/help" className="font-semibold text-brand hover:underline">
            centre d'aide
          </Link>
          , vous y trouverez une réponse à la plupart des questions fréquentes.
        </p>
      </Card>
    </div>
  );
}
