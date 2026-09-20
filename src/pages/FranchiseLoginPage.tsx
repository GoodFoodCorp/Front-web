import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, LineChart, Package, Store } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import logo from '../assets/logo.svg';

const FEATURES = [
  { icon: Package, text: 'Gérez vos menus, articles et stocks' },
  { icon: LineChart, text: "Suivez les commandes et l'activité de votre restaurant" },
  { icon: Building2, text: 'Retrouvez vos fournisseurs et vos réapprovisionnements' },
];

export function FranchiseLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="overflow-hidden rounded-3xl bg-brand px-8 py-12 text-white sm:px-12">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
            <img src={logo} alt="Good Food" className="h-10 w-10" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-accent">
            <Store size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">Espace franchisé</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Portail de gestion</h1>
          <p className="mt-3 max-w-md text-white/70">
            Franchisés et équipe du siège, connectez-vous avec votre compte Good Food pour accéder à
            votre portail de gestion.
          </p>

          <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.text} className="rounded-xl bg-white/10 p-4 text-left">
                <f.icon size={18} className="text-accent" />
                <p className="mt-2 text-sm text-white/80">{f.text}</p>
              </div>
            ))}
          </div>

          <Button
            variant="accent"
            className="mt-8 w-full sm:w-auto"
            onClick={() => navigate('/login', { state: { from: '/portal' } })}
          >
            Se connecter à mon portail
          </Button>
        </div>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-brand">Pas encore franchisé ?</h2>
          <p className="mt-1 text-sm text-neutral-500">Découvrez comment rejoindre le réseau Good Food.</p>
        </div>
        <Link to="/become-franchisee">
          <Button variant="ghost" className="shrink-0">
            Devenir franchisé
          </Button>
        </Link>
      </Card>
    </div>
  );
}
