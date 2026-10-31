import { Link } from 'react-router-dom';
import { LegalPage } from '../components/LegalPage';
import { LEGAL } from '../config/legal';

const ROWS: [string, string, string][] = [
  ['Compte (email, mot de passe chiffré, profil, adresses)', 'Exécution du contrat', 'Jusqu’à la suppression de votre compte'],
  ['Commandes et factures', 'Exécution du contrat ; obligation légale', 'Factures : 10 ans (Code de commerce, art. L123-22)'],
  ['Paiement', 'Exécution du contrat', 'Traité par Stripe ; nous ne gardons que la marque et les 4 derniers chiffres des cartes enregistrées'],
  ['Position du livreur pendant une course', 'Exécution du contrat', '24 heures, puis supprimée automatiquement'],
  ['Notifications', 'Exécution du contrat', '30 jours (1 jour pour les offres de course)'],
  ['Avis', 'Intérêt légitime (information des clients)', 'Tant que le restaurant est en ligne, sans votre nom'],
  ['Messages à l’assistant', 'Exécution du contrat (aide à la commande)', 'Non conservés par nous après la conversation'],
  ['Emails promotionnels', 'Consentement (désactivés par défaut)', 'Jusqu’au retrait du consentement'],
];

/** RGPD art. 13: who processes what, why, for how long, with whom, and your rights. */
export function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro={
        <p>
          {LEGAL.company} ({LEGAL.address}) est responsable des traitements décrits ci-dessous. Pour toute question ou
          pour exercer vos droits : <a className="text-brand underline" href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
        </p>
      }
      sections={[
        {
          title: '1. Données, finalités, bases légales et durées',
          body: (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="text-neutral-400">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-semibold">Données et usage</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Base légale</th>
                    <th scope="col" className="py-2 font-semibold">Conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/10">
                  {ROWS.map(([what, basis, keep]) => (
                    <tr key={what}>
                      <td className="py-2 pr-3 align-top text-neutral-700">{what}</td>
                      <td className="py-2 pr-3 align-top">{basis}</td>
                      <td className="py-2 align-top">{keep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          title: '2. Destinataires',
          body: (
            <>
              <p>Vos données ne sont jamais vendues. Seuls y accèdent, pour ce qui les concerne :</p>
              <ul>
                <li>le restaurant qui prépare votre commande (contenu, adresse de livraison) ;</li>
                <li>le livreur de la course (adresse de livraison, pendant la livraison seulement) ;</li>
                <li>le siège {LEGAL.company}, pour le support et la comptabilité.</li>
              </ul>
              <p>Nos sous-traitants, liés par contrat :</p>
              <ul>
                <li>Stripe (paiement par carte) ;</li>
                <li>Microsoft Azure OpenAI (assistant de commande, uniquement le texte de vos messages) ;</li>
                <li>OpenStreetMap et ses partenaires (fonds de carte, calcul d’itinéraire, recherche d’adresse) ;</li>
                <li>notre prestataire d’envoi d’emails et notre hébergeur.</li>
              </ul>
            </>
          ),
        },
        {
          title: '3. Transferts hors de l’Union européenne',
          body: (
            <p>
              Certains sous-traitants (Stripe, Microsoft) peuvent traiter des données hors de l’Union européenne. Ces
              transferts sont encadrés par les clauses contractuelles types de la Commission européenne ou le cadre de
              protection des données UE–États-Unis.
            </p>
          ),
        },
        {
          id: 'cookies',
          title: '4. Cookies et stockage local',
          body: (
            <p>
              Nous n’utilisons que des cookies strictement nécessaires, exemptés de consentement : la session de
              connexion (cookies sécurisés, inaccessibles aux scripts) et la protection de la connexion par Google ou
              Microsoft. Votre panier et vos préférences d’affichage restent dans votre navigateur. Aucun cookie
              publicitaire, de mesure d’audience ou de réseau social.
            </p>
          ),
        },
        {
          title: '5. Vos droits',
          body: (
            <>
              <p>
                Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de
                portabilité, et pouvez définir des directives sur le sort de vos données après votre décès.
              </p>
              <p>
                Depuis votre <Link className="text-brand underline" to="/profile">profil</Link>, vous pouvez à tout moment
                télécharger vos données, modifier vos informations, retirer votre consentement aux emails promotionnels
                et supprimer votre compte. Pour le reste, écrivez à{' '}
                <a className="text-brand underline" href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> : nous
                répondons sous un mois.
              </p>
              <p>
                Vous pouvez aussi adresser une réclamation à la CNIL (
                <a className="text-brand underline" href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>).
              </p>
            </>
          ),
        },
        {
          title: '6. Sécurité',
          body: (
            <p>
              Les échanges sont chiffrés (HTTPS), les mots de passe stockés sous forme irréversible, les tentatives de
              connexion limitées, et chaque compte n’accède qu’aux données de son rôle et de son restaurant. Les données
              d’un restaurant ne sont jamais visibles par un autre franchisé.
            </p>
          ),
        },
      ]}
    />
  );
}
