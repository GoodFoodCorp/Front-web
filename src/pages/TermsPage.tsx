import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';

const SECTIONS = [
  {
    title: '1. Objet',
    text: "Les présentes conditions générales d'utilisation régissent l'accès et l'usage de la plateforme Good Food, permettant de consulter les restaurants du réseau, commander des repas, réserver une table et, pour les franchisés, gérer leur restaurant.",
  },
  {
    title: '2. Création de compte',
    text: "L'utilisation de certaines fonctionnalités (commande, réservation, portail franchisé) nécessite la création d'un compte. Vous vous engagez à fournir des informations exactes et à préserver la confidentialité de vos identifiants.",
  },
  {
    title: '3. Commandes et paiement',
    text: 'Chaque commande passée sur la plateforme est associée à un restaurant précis et est traitée par ce restaurant. Le paiement est effectué en ligne au moment de la validation de la commande.',
  },
  {
    title: '4. Réservations',
    text: "Les réservations de table sont soumises à la disponibilité du restaurant sélectionné. Le restaurant se réserve le droit d'annuler une réservation en cas d'indisponibilité exceptionnelle, avec notification préalable.",
  },
  {
    title: '5. Espace franchisé',
    text: "L'accès au portail franchisé est réservé aux franchisés du réseau Good Food, sous la responsabilité du restaurant auquel ils sont rattachés (gestion des menus, des stocks et des commandes de ce restaurant uniquement).",
  },
  {
    title: '6. Responsabilité',
    text: "Good Food met en relation les clients avec les restaurants du réseau mais n'intervient pas dans la préparation des repas, sous la responsabilité exclusive de chaque restaurant franchisé.",
  },
  {
    title: '7. Modification des conditions',
    text: "Good Food peut faire évoluer les présentes conditions. Les utilisateurs seront informés de toute modification substantielle.",
  },
];

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Conditions d'utilisation</h1>
        <p className="mt-1 text-sm text-neutral-400">Dernière mise à jour : janvier 2026</p>
      </div>

      <Card className="space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-display font-bold text-brand">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{s.text}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
