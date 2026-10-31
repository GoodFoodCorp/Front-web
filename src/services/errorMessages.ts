/**
 * The services word their refusals in English (for logs and API clients);
 * people using the app read French. Known refusals are translated here, in
 * one place; any other English message falls back to a French sentence for
 * its status, so a technical wording never reaches the screen.
 */
const TRANSLATIONS: [RegExp, string | ((m: RegExpMatchArray) => string)][] = [
  // Session and access
  [/authentication required|missing authentication token|invalid or expired token|not an access token/i, 'Votre session a expiré. Reconnectez-vous.'],
  [/insufficient role|requires role/i, "Votre compte n'a pas accès à cette action."],
  [/your account is not linked to a restaurant/i, "Votre compte n'est rattaché à aucun restaurant. Contactez le siège."],
  [/only head office can manage categories/i, 'Seul le siège peut gérer les catégories de la carte.'],
  [/only head office can manage promo codes/i, 'Seul le siège peut gérer les codes promo.'],
  [/only a restaurant manager (or head office )?can manage (the catalog|recipes)/i, 'Seul le gérant du restaurant peut modifier la carte.'],
  [/only a restaurant manager can do this/i, 'Action réservée au gérant du restaurant.'],
  [/managers can only (update|cancel) orders of their own restaurant/i, 'Cette commande appartient à un autre restaurant.'],
  [/only customers can place orders/i, 'Seul un compte client peut passer commande.'],
  [/only customers can book a table/i, 'Seul un compte client peut réserver une table.'],
  [/you (can only|are not allowed to).*(order|payment|invoice)/i, "Vous n'avez pas accès à cette commande."],
  [/only the customer, the restaurant and head office see the invoice/i, "Vous n'avez pas accès à cette facture."],
  [/(this (item|menu) is not yours)|a menu can only use your own dishes/i, "Cet élément n'appartient pas à votre restaurant."],

  // Ordering
  [/an order requires at least one item/i, 'Votre panier est vide.'],
  [/delivery address is required/i, 'Indiquez une adresse de livraison.'],
  [/deliveries are limited to the European Union/i, "Nous livrons uniquement dans l'Union européenne."],
  [/address not found/i, 'Adresse introuvable : vérifiez le numéro, la rue et la ville.'],
  [/item quantity must be greater than zero/i, 'La quantité doit être au moins de 1.'],
  [/at most (\d+) of one dish/i, (m) => `Au plus ${m[1]} exemplaires d'un même plat par commande.`],
  [/tip must be between 0 and 100/i, 'Le pourboire doit être compris entre 0 et 100 €.'],
  [/menu item not found|one or more selected dishes do not exist|unknown dish/i, "Un plat de votre panier n'existe plus. Retirez-le pour continuer."],
  [/unknown or closed restaurant|unknown restaurant|restaurant not found/i, "Ce restaurant n'est pas disponible."],
  [/promo code not found/i, "Ce code promo n'existe pas."],
  [/invalid discount for this order/i, "Ce code promo ne s'applique pas à cette commande."],
  [/order not found/i, 'Commande introuvable.'],
  [/order is not awaiting payment|this order has already been paid or closed|payment is no longer awaiting payment/i, "Cette commande n'est plus en attente de paiement. Actualisez la page."],
  [/payment not completed/i, "Le paiement n'a pas abouti. Vérifiez votre carte ou essayez-en une autre."],
  [/order was cancelled while its payment was being confirmed/i, 'La commande a été annulée pendant le paiement : vous serez remboursé.'],
  [/the restaurant has already started this order/i, 'Le restaurant a déjà commencé à préparer votre commande : contactez-le pour annuler.'],
  [/a cancellation (needs a|reason is) /i, "Indiquez la raison de l'annulation."],
  [/say what happened when the reason is OTHER/i, "Précisez la raison de l'annulation."],
  [/the comment is limited to (\d+) characters/i, (m) => `Le commentaire est limité à ${m[1]} caractères.`],
  [/cannot transition order from (\w+) to (\w+)/i, "Cette étape n'est plus possible : la commande a changé. Actualisez la page."],
  [/order changed concurrently|changed concurrently/i, "La commande vient d'être modifiée ailleurs. Actualisez la page."],
  [/no invoice: this order has not been paid/i, "La facture sera disponible une fois la commande payée."],
  [/invoices are not available/i, 'Les factures sont momentanément indisponibles.'],

  // Reviews
  [/only a delivered order can be reviewed/i, 'Vous pourrez donner votre avis une fois la commande reçue.'],
  [/this order has already been reviewed/i, 'Vous avez déjà donné votre avis sur cette commande.'],
  [/reviews are open for (\d+) days/i, (m) => `Les avis sont ouverts ${m[1]} jours après la commande.`],
  [/rating must be (an integer )?(from|between) 1 (to|and) 5/i, 'Choisissez une note de 1 à 5 étoiles.'],
  [/only a delivered delivery can be rated, once/i, 'Vous avez déjà noté cette livraison.'],

  // Payment methods
  [/this card is already saved/i, 'Cette carte est déjà enregistrée.'],
  [/card has already expired/i, 'Cette carte a expiré.'],
  [/this card must be registered again/i, 'Cette carte doit être enregistrée à nouveau avant de pouvoir servir.'],
  [/payment method not found|this card is not registered for your account|this payment method belongs to another user/i, "Cette carte n'est plus disponible. Choisissez-en une autre."],

  // Catalog and stock (back office)
  [/item name is required|menu name is required|category name is required/i, 'Le nom est obligatoire.'],
  [/item category is required/i, 'Choisissez une catégorie.'],
  [/(item|menu) price must be greater than zero/i, 'Le prix doit être supérieur à 0 €.'],
  [/a menu needs at least one dish/i, 'Une formule doit contenir au moins un plat.'],
  [/image must be a data:image/i, "Le fichier choisi n'est pas une image."],
  [/image is too large/i, "L'image est trop lourde (3 Mo au maximum)."],
  [/avatar must be a JPEG, PNG or WebP image/i, 'La photo doit être au format JPEG, PNG ou WebP.'],
  [/avatar must be a non-empty image of at most 5 MB/i, 'La photo doit faire au plus 5 Mo.'],
  [/this category already exists/i, 'Cette catégorie existe déjà.'],
  [/category not found|menu not found/i, 'Élément introuvable : il a peut-être été supprimé.'],
  [/a promo code with this name already exists/i, 'Un code promo porte déjà ce nom.'],
  [/this code has already been used/i, 'Ce code a déjà servi : désactivez-le plutôt que de le supprimer.'],
  [/percentOff must be between 1 and 100/i, 'La réduction doit être comprise entre 1 et 100 %.'],
  [/expiresAt must be after startsAt/i, 'La date de fin doit suivre la date de début.'],
  [/maxRedemptions/i, "Le nombre maximal d'utilisations n'est pas valide."],
  [/minOrderAmountCents cannot be negative/i, 'Le montant minimum ne peut pas être négatif.'],

  // Profile and addresses
  [/street is required/i, 'Indiquez la rue.'],
  [/city is required/i, 'Indiquez la ville.'],
  [/phone number is too long/i, 'Le numéro de téléphone est trop long.'],
  [/this address belongs to another user/i, "Cette adresse n'est pas la vôtre."],

  // Delivery
  [/order already claimed by another courier|this delivery is (already assigned|assigned to another courier)/i, 'Un autre livreur a déjà pris cette course.'],
  [/too many wrong codes/i, 'Trop de codes erronés : contactez le support pour clôturer cette livraison.'],
  [/cannot (pick up|drop off) a delivery in status/i, "Cette étape de la livraison n'est plus possible. Actualisez la page."],
  [/can no longer be released/i, 'Cette course ne peut plus être libérée.'],
  [/position updates are only accepted during an active delivery|lat and lng must be valid coordinates/i, 'Position GPS non prise en compte.'],
  [/delivery not found/i, 'Livraison introuvable.'],
  [/you are not allowed to view this delivery/i, "Vous n'avez pas accès à cette livraison."],

  // Reservations
  [/a reservation must be in the future/i, 'Choisissez un créneau à venir.'],
  [/this restaurant is fully booked for that time slot/i, 'Ce créneau est complet : choisissez-en un autre.'],
  [/no service at ([\d:]+)/i, (m) => `Pas de service à ${m[1]} : choisissez un créneau du midi ou du soir.`],
  [/reservation not found/i, 'Réservation introuvable.'],
  [/cannot move a reservation from/i, "Cette réservation ne peut plus changer d'état. Actualisez la page."],
  [/this reservation belongs to another/i, "Vous n'avez pas accès à cette réservation."],

  // Infrastructure
  [/unreachable|circuit open|briefly down|temporarily|timeout|unavailable/i, 'Le service est momentanément indisponible. Réessayez dans un instant.'],
];

const BY_STATUS: Record<number, string> = {
  400: 'Certaines informations ne sont pas valides. Vérifiez votre saisie.',
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: "Vous n'avez pas accès à cette action.",
  404: 'Élément introuvable : il a peut-être été supprimé.',
  409: "Cette action n'est plus possible : les informations ont changé. Actualisez la page.",
  413: 'Le fichier est trop lourd.',
  422: 'Certaines informations ne sont pas valides. Vérifiez votre saisie.',
  429: 'Trop de tentatives. Réessayez dans une minute.',
};

/** A sentence in English: any of its everyday words, and no French letter. */
const looksEnglish = (m: string) =>
  !/[àâçéèêëîïôûùüÿœ’«»]/i.test(m) &&
  /\b(the|is|are|was|must|not|only|cannot|can|be|this|that|your|you|of|for|with|already|required|invalid|found|unknown|allowed|exists?|failed|error|occurred)\b/i.test(m);

export function frenchError(message: string, status: number): string {
  for (const [re, fr] of TRANSLATIONS) {
    const m = message.match(re);
    if (m) return typeof fr === 'string' ? fr : fr(m);
  }
  // A server failure's details are never the user's business.
  if (status >= 500) return 'Le service est momentanément indisponible. Réessayez dans un instant.';
  if (message.trim() && !looksEnglish(message)) return message;
  return BY_STATUS[status] ?? 'Une erreur est survenue. Réessayez.';
}
