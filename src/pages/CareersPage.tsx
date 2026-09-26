import { Link } from 'react-router-dom';
import { ArrowLeft, Bike, ChefHat, Mail, Store } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const OPENINGS = [
  {
    icon: ChefHat,
    title: 'Équipier(ère) restauration',
    type: 'CDI / CDD — temps plein ou partiel',
    location: 'Tous nos restaurants',
  },
  {
    icon: Bike,
    title: 'Livreur(euse)',
    type: 'CDI / Indépendant',
    location: 'Paris et grandes villes',
  },
  {
    icon: Store,
    title: 'Manager de restaurant',
    type: 'CDI — temps plein',
    location: 'Selon ouvertures',
  },
];

const JOBS_EMAIL = 'carrieres@goodfood.fr';

export function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="brand-texture overflow-hidden rounded-3xl bg-brand px-8 py-10 text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Carrières chez Good Food</h1>
        <p className="mt-2 max-w-xl text-white/70">
          Rejoignez un réseau de restaurants indépendants qui grandit chaque année. Cuisine,
          livraison, gestion : il y a une place pour vous.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-brand">Postes ouverts</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPENINGS.map((job) => (
            <Card key={job.title}>
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-pale text-brand">
                  <job.icon size={18} />
                </div>
                <Badge tone="green">Ouvert</Badge>
              </div>
              <h3 className="mt-3 font-display font-bold text-brand">{job.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{job.type}</p>
              <p className="text-sm text-neutral-400">{job.location}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-brand">Une offre ne correspond pas ?</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Envoyez-nous votre candidature spontanée, nous la transmettrons au restaurant le plus
            proche de chez vous.
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.href = `mailto:${JOBS_EMAIL}?subject=${encodeURIComponent('Candidature spontanée')}`;
          }}
          className="shrink-0"
        >
          <Mail size={16} /> Nous écrire
        </Button>
      </Card>
    </div>
  );
}
