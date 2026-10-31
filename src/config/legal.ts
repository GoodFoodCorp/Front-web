/**
 * The publisher's legal identity, shown on the legal pages (LCEN art. 6,
 * Code de la consommation L111-1 and L612-1, RGPD art. 13). Registration
 * numbers, host and consumer mediator are the company's own: set them at
 * build time (VITE_LEGAL_*); a field left empty is not shown.
 */
const env = import.meta.env;

export const LEGAL = {
  company: (env.VITE_LEGAL_COMPANY as string | undefined) ?? 'Good Food',
  legalForm: (env.VITE_LEGAL_FORM as string | undefined) ?? '',
  capital: (env.VITE_LEGAL_CAPITAL as string | undefined) ?? '',
  address: (env.VITE_LEGAL_ADDRESS as string | undefined) ?? '12 rue de la République, 75011 Paris',
  rcs: (env.VITE_LEGAL_RCS as string | undefined) ?? '',
  vatNumber: (env.VITE_LEGAL_VAT as string | undefined) ?? '',
  email: (env.VITE_LEGAL_EMAIL as string | undefined) ?? 'contact@goodfood.fr',
  privacyEmail: (env.VITE_LEGAL_PRIVACY_EMAIL as string | undefined) ?? 'contact@goodfood.fr',
  phone: (env.VITE_LEGAL_PHONE as string | undefined) ?? '+33 1 23 45 67 89',
  publicationDirector: (env.VITE_LEGAL_DIRECTOR as string | undefined) ?? '',
  host: (env.VITE_LEGAL_HOST as string | undefined) ?? '',
  mediator: (env.VITE_LEGAL_MEDIATOR as string | undefined) ?? '',
  updatedAt: 'octobre 2026',
};
