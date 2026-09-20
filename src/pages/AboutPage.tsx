import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Leaf, Users } from 'lucide-react';
import { Card } from '../components/Card';

const VALUES = [
  {
    icon: Leaf,
    title: 'Des produits frais',
    text: "Nous travaillons avec des producteurs locaux pour composer des menus de qualité, renouvelés selon les saisons.",
  },
  {
    icon: Heart,
    title: 'La passion du métier',
    text: 'Chaque restaurant Good Food est tenu par un franchisé passionné, formé à nos standards et libre de faire vivre son quartier.',
  },
  {
    icon: Users,
    title: 'Une équipe à taille humaine',
    text: "De la cuisine à la livraison, nos équipes mettent un point d'honneur à vous servir rapidement et avec le sourire.",
  },
];

const STATS = [
  { value: '2019', label: 'Année de création' },
  { value: '40+', label: 'Restaurants en France' },
  { value: '250k+', label: 'Commandes servies' },
  { value: '4.6/5', label: 'Satisfaction client' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="brand-texture overflow-hidden rounded-3xl bg-brand px-8 py-10 text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">À propos de Good Food</h1>
        <p className="mt-2 max-w-xl text-white/70">
          Des repas de qualité, à côté de chez vous. Découvrez notre histoire et ce qui nous anime au
          quotidien.
        </p>
      </div>

      <Card>
        <h2 className="font-display text-xl font-bold text-brand">Notre histoire</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Good Food est né d'une conviction simple : bien manger ne devrait jamais être un compromis
          entre qualité et rapidité. Depuis notre premier restaurant, nous construisons un réseau de
          franchises indépendantes qui partagent nos recettes, nos exigences qualité et notre volonté
          de servir des plats préparés avec soin, disponibles en livraison ou à emporter.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Aujourd'hui, chaque franchisé gère son propre restaurant — ses menus, ses stocks, son
          équipe — tout en s'appuyant sur les outils et la marque Good Food pour se concentrer sur
          l'essentiel : vous régaler.
        </p>
      </Card>

      <div className="grid gap-5 sm:grid-cols-3">
        {VALUES.map((v) => (
          <Card key={v.title} className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-pale text-brand">
              <v.icon size={22} />
            </div>
            <h3 className="mt-3 font-display font-bold text-brand">{v.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-500">{v.text}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="font-display text-2xl font-extrabold text-brand">{s.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
