import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Mail } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const FAQS = [
  {
    question: 'Comment suivre ma commande ?',
    answer:
      "Rendez-vous dans « Mes commandes » depuis votre compte pour voir le statut en temps réel : en préparation, prête, en livraison, puis livrée.",
  },
  {
    question: 'Puis-je annuler une commande ?',
    answer:
      "Une commande peut être annulée tant qu'elle n'est pas encore en préparation. Passé ce stade, contactez directement le restaurant depuis la page de détail de la commande.",
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer:
      'Le paiement est sécurisé et débité au moment de la confirmation de la commande. Nous acceptons les principales cartes bancaires.',
  },
  {
    question: 'Comment réserver une table ?',
    answer:
      "Depuis l'onglet « Réservations », choisissez un restaurant, une date et un nombre de couverts. Vous recevrez une confirmation dès validation par le restaurant.",
  },
  {
    question: 'Comment devenir franchisé Good Food ?',
    answer: (
      <>
        Toutes les informations sont disponibles sur notre page{' '}
        <Link to="/become-franchisee" className="font-semibold text-brand hover:underline">
          Devenir franchisé
        </Link>
        . Notre équipe étudie chaque candidature individuellement.
      </>
    ),
  },
  {
    question: "Je n'ai pas reçu mon email de confirmation, que faire ?",
    answer:
      "Vérifiez vos courriers indésirables. Si le problème persiste, contactez-nous, nous vérifierons votre compte manuellement.",
  },
];

export function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="brand-texture overflow-hidden rounded-3xl bg-brand px-8 py-10 text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Centre d'aide</h1>
        <p className="mt-2 max-w-xl text-white/70">
          Les réponses aux questions les plus fréquentes. Vous ne trouvez pas la vôtre ?
          Contactez-nous.
        </p>
      </div>

      <div className="divide-y divide-brand/10 overflow-hidden rounded-2xl border border-brand/10 bg-white">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-display font-semibold text-brand">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>}
            </div>
          );
        })}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-brand">Toujours besoin d'aide ?</h2>
          <p className="mt-1 text-sm text-neutral-500">Notre équipe support vous répond rapidement.</p>
        </div>
        <Link to="/contact">
          <Button className="shrink-0">
            <Mail size={16} /> Nous contacter
          </Button>
        </Link>
      </Card>
    </div>
  );
}
