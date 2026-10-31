import { Link } from 'react-router-dom';
import { LegalPage } from '../components/LegalPage';
import { LEGAL } from '../config/legal';

/** Mentions légales (LCEN art. 6 III). */
export function LegalNoticePage() {
  const company = [LEGAL.company, LEGAL.legalForm, LEGAL.capital && `au capital de ${LEGAL.capital}`].filter(Boolean).join(', ');
  return (
    <LegalPage
      title="Mentions légales"
      sections={[
        {
          title: 'Éditeur du site',
          body: (
            <>
              <p>{company}</p>
              <p>{LEGAL.address}</p>
              {LEGAL.rcs && <p>{LEGAL.rcs}</p>}
              {LEGAL.vatNumber && <p>TVA intracommunautaire : {LEGAL.vatNumber}</p>}
              <p>
                Contact : <a className="text-brand underline" href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> ·{' '}
                {LEGAL.phone}
              </p>
            </>
          ),
        },
        ...(LEGAL.publicationDirector
          ? [{ title: 'Directeur de la publication', body: <p>{LEGAL.publicationDirector}</p> }]
          : []),
        ...(LEGAL.host ? [{ title: 'Hébergement', body: <p>{LEGAL.host}</p> }] : []),
        {
          title: 'Restaurants',
          body: (
            <p>
              Chaque restaurant du réseau est exploité par un franchisé indépendant, responsable de la préparation des
              repas, de leur composition et de l’information sur les allergènes. Son nom et son adresse figurent sur sa
              page et sur chaque facture.
            </p>
          ),
        },
        {
          title: 'Propriété intellectuelle',
          body: (
            <p>
              La marque Good Food, son logo, les textes et la présentation du site sont protégés. Toute reproduction sans
              autorisation est interdite. Les photographies d’illustration proviennent de banques d’images libres de droits.
            </p>
          ),
        },
        {
          title: 'Données personnelles et cookies',
          body: (
            <p>
              Voir la <Link className="text-brand underline" to="/privacy">politique de confidentialité</Link>. Le site
              n’utilise que des cookies nécessaires à son fonctionnement (session, sécurité) : aucun cookie publicitaire
              ni de mesure d’audience.
            </p>
          ),
        },
        {
          title: 'Conditions',
          body: (
            <p>
              Les commandes sont régies par les{' '}
              <Link className="text-brand underline" to="/terms">conditions générales d’utilisation et de vente</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
