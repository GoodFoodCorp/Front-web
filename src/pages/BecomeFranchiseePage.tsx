import { Link } from 'react-router-dom';
import { ArrowLeft, Handshake, LineChart, Mail, ShieldCheck, Store } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const STEPS = [
  {
    icon: Mail,
    title: 'Candidature',
    text: 'Envoyez-nous votre projet et votre secteur géographique souhaité.',
  },
  {
    icon: Handshake,
    title: 'Échange',
    text: "Un entretien avec notre équipe développement pour valider le projet ensemble.",
  },
  {
    icon: ShieldCheck,
    title: 'Formation',
    text: 'Formation aux standards Good Food : recettes, gestion, outils du portail franchisé.',
  },
  {
    icon: Store,
    title: 'Ouverture',
    text: 'Votre restaurant rejoint le réseau, avec vos propres menus, stocks et équipe.',
  },
];

const ADVANTAGES = [
  'Une marque reconnue et un réseau de plus de 40 restaurants',
  "Un portail de gestion dédié : menus, stocks, commandes, réservations",
  "Un accompagnement à l'ouverture et une formation complète",
  'Une totale autonomie sur la gestion quotidienne de votre restaurant',
];

const FRANCHISE_EMAIL = 'franchise@goodfood.fr';

export function BecomeFranchiseePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="overflow-hidden rounded-3xl bg-brand px-8 py-10 text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Devenez franchisé Good Food</h1>
        <p className="mt-2 max-w-xl text-white/70">
          Ouvrez votre restaurant sous l'enseigne Good Food et gérez-le en toute autonomie grâce à
          notre portail dédié.
        </p>
        <Button
          variant="accent"
          className="mt-6"
          onClick={() => {
            window.location.href = `mailto:${FRANCHISE_EMAIL}?subject=${encodeURIComponent('Candidature franchise Good Food')}`;
          }}
        >
          <Mail size={16} /> Envoyer ma candidature
        </Button>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-brand">Les étapes pour nous rejoindre</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="relative">
              <span className="absolute right-4 top-4 font-display text-2xl font-extrabold text-brand/10">
                {i + 1}
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-pale text-brand">
                <s.icon size={19} />
              </div>
              <h3 className="mt-3 font-display font-bold text-brand">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{s.text}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <LineChart size={20} className="text-brand" />
          <h2 className="font-display text-lg font-bold text-brand">Pourquoi rejoindre le réseau ?</h2>
        </div>
        <ul className="mt-4 space-y-2.5">
          {ADVANTAGES.map((a) => (
            <li key={a} className="flex items-start gap-2.5 text-sm text-neutral-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {a}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-brand">Déjà franchisé Good Food ?</h2>
          <p className="mt-1 text-sm text-neutral-500">Accédez à votre portail de gestion.</p>
        </div>
        <Link to="/franchise-login">
          <Button variant="ghost" className="shrink-0">
            Connexion franchise
          </Button>
        </Link>
      </Card>
    </div>
  );
}
