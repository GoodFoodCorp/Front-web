import { Link } from 'react-router-dom';
import { LegalPage } from '../components/LegalPage';
import { LEGAL } from '../config/legal';

/** CGU + CGV: using the platform, and buying meals on it as a consumer. */
export function TermsPage() {
  return (
    <LegalPage
      title="Conditions générales d’utilisation et de vente"
      intro={
        <p>
          Les présentes conditions s’appliquent à toute utilisation de la plateforme {LEGAL.company} et à toute commande
          passée en ligne. Elles sont acceptées lors de la création du compte et rappelées au moment de commander.
        </p>
      }
      sections={[
        {
          title: '1. Objet et parties',
          body: (
            <p>
              La plateforme permet de consulter les restaurants du réseau, de commander des repas en livraison ou à
              emporter, de réserver une table et, pour les franchisés, de gérer leur restaurant. Chaque repas est préparé
              et vendu par le restaurant franchisé choisi, dont l’identité figure sur sa page et sur la facture.
            </p>
          ),
        },
        {
          title: '2. Compte',
          body: (
            <p>
              Certaines fonctionnalités nécessitent un compte, réservé aux personnes majeures. Vous vous engagez à fournir
              des informations exactes et à garder votre mot de passe confidentiel. Vous pouvez supprimer votre compte à
              tout moment depuis votre profil.
            </p>
          ),
        },
        {
          title: '3. Prix',
          body: (
            <>
              <p>
                Les prix sont indiqués en euros, toutes taxes comprises (TVA à 10 % sur les repas, 20 % sur la livraison).
                Les frais de livraison, le minimum de commande et le délai estimé de chaque restaurant sont affichés avant
                la validation. Le pourboire est facultatif et revient au livreur.
              </p>
              <p>
                Un code promo s’applique dans les conditions affichées (montant minimum, durée, une utilisation par client
                le cas échéant) ; il ne peut être ni échangé ni remboursé.
              </p>
            </>
          ),
        },
        {
          title: '4. Commande et paiement',
          body: (
            <p>
              La commande est ferme une fois le paiement accepté. Le paiement se fait par carte bancaire via notre
              prestataire Stripe, avec authentification forte (3-D Secure) si votre banque la demande ; {LEGAL.company} ne
              conserve jamais votre numéro de carte. Une confirmation s’affiche immédiatement et la facture vous est
              envoyée par email.
            </p>
          ),
        },
        {
          title: '5. Livraison et retrait',
          body: (
            <p>
              Les délais affichés sont des estimations, mises à jour en temps réel pendant la livraison. À la livraison,
              communiquez au livreur le code à quatre chiffres affiché dans votre commande. Pour une commande à emporter,
              présentez-vous au restaurant une fois la commande prête.
            </p>
          ),
        },
        {
          id: 'annulation',
          title: '6. Annulation, rétractation et remboursement',
          body: (
            <>
              <p>
                Conformément à l’article L221-28 4° du Code de la consommation, le droit de rétractation ne s’applique pas
                aux repas, denrées susceptibles de se détériorer rapidement.
              </p>
              <p>
                Vous pouvez néanmoins annuler gratuitement votre commande depuis la page de commande tant que le restaurant
                n’a pas commencé sa préparation. Si le restaurant annule (produit indisponible, fermeture), vous êtes
                intégralement remboursé. Les remboursements sont faits sur la carte utilisée, sous 5 à 10 jours selon
                votre banque.
              </p>
            </>
          ),
        },
        {
          title: '7. Allergènes',
          body: (
            <p>
              Les 14 allergènes réglementaires présents dans chaque plat sont indiqués sur la carte avant la commande. En
              cas d’allergie sévère, contactez le restaurant avant de commander.
            </p>
          ),
        },
        {
          id: 'avis',
          title: '8. Avis clients',
          body: (
            <p>
              Seuls les clients ayant reçu leur commande peuvent noter le restaurant, une fois par commande et dans les 30
              jours. Les avis sont publiés sans contrepartie, sans contrôle préalable et du plus récent au plus ancien,
              avec la date de l’avis et celle de la commande. Un avis contraire à la loi (injure, données personnelles,
              hors sujet) peut être retiré ; signalez-le-nous via la page <Link className="text-brand underline" to="/contact">contact</Link>.
            </p>
          ),
        },
        {
          title: '9. Réservations',
          body: (
            <p>
              Les réservations sont confirmées par le restaurant selon ses disponibilités. Merci d’annuler depuis votre
              espace si vous ne pouvez pas venir.
            </p>
          ),
        },
        {
          title: '10. Espace franchisé et livreurs',
          body: (
            <p>
              Le portail franchisé est réservé aux franchisés du réseau, pour leur seul restaurant. Les livreurs utilisent
              l’application sous leur statut d’indépendant ; leur position n’est partagée que pendant une livraison en cours et n’est conservée que 24 heures.
            </p>
          ),
        },
        {
          title: '11. Réclamations et médiation',
          body: (
            <>
              <p>
                Pour toute réclamation, écrivez-nous à{' '}
                <a className="text-brand underline" href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> ou via la page{' '}
                <Link className="text-brand underline" to="/contact">contact</Link>.
              </p>
              <p>
                En cas de litige non résolu, vous pouvez recourir gratuitement au médiateur de la consommation
                {LEGAL.mediator ? ` : ${LEGAL.mediator}` : ' dont nous relevons'} (articles L612-1 et suivants du Code de la
                consommation), ou à la plateforme européenne de règlement en ligne des litiges.
              </p>
            </>
          ),
        },
        {
          title: '12. Droit applicable',
          body: (
            <p>
              Les présentes conditions sont soumises au droit français. Elles peuvent évoluer : la version applicable est
              celle en vigueur au moment de la commande.
            </p>
          ),
        },
      ]}
    />
  );
}
