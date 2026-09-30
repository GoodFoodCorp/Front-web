import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';

const SECTIONS = [
  {
    title: '1. Données collectées',
    text: "Nous collectons les données nécessaires au fonctionnement du service : identité, email, historique de commandes et de réservations, et, pour les franchisés, les données de gestion du restaurant (menus, stocks, fournisseurs).",
  },
  {
    title: '2. Finalité du traitement',
    text: "Ces données servent à gérer votre compte, traiter vos commandes et réservations, et, pour les franchisés, exploiter leur restaurant au sein du réseau. Elles ne sont jamais utilisées à des fins étrangères à ce service.",
  },
  {
    title: '3. Cloisonnement par restaurant',
    text: "Les données de gestion (menus, stocks, commandes) d'un restaurant ne sont accessibles qu'au franchisé de ce restaurant et au siège. Un franchisé n'a jamais accès aux données d'un autre restaurant du réseau.",
  },
  {
    title: '4. Conservation',
    text: "Vos données sont conservées pendant la durée nécessaire à la gestion de votre compte et de votre relation avec Good Food, puis archivées ou supprimées conformément aux obligations légales.",
  },
  {
    title: '5. Vos droits',
    text: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits en nous contactant.",
  },
  {
    title: '6. Sécurité',
    text: "L'accès à la plateforme est protégé par authentification et les échanges sont chiffrés. Chaque compte n'a accès qu'aux données correspondant à son rôle et à son restaurant.",
  },
];

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Politique de confidentialité</h1>
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

      <Card>
        <h2 className="font-display font-bold text-brand">Une question sur vos données ?</h2>
        <p className="mt-1.5 text-sm text-neutral-600">
          Contactez-nous depuis notre{' '}
          <Link to="/contact" className="font-semibold text-brand hover:underline">
            page de contact
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
