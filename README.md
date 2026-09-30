# Web App

Interface web **React** de Good Food 3.0 : le **storefront client** (façon Uber
Eats) et le **portail franchisé**.

| | |
|---|---|
| **Langage / techno** | TypeScript, React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Router, lucide-react |
| **Serveur (production)** | nginx (image Docker) |
| **Port** | `3000` |
| **URL** | http://localhost:3000 |

---

## Architecture

```
src/
├── app/
│   ├── App.tsx            # Composant racine
│   ├── providers.tsx      # QueryClientProvider + BrowserRouter
│   └── router.tsx         # Table de routes (gardes incluses)
├── assets/
├── components/            # UI pure — un dossier par composant
│                          #   Button/, Input/, Card/, Badge/, Spinner/,
│                          #   EmptyState/, RequireRole/
├── config/                # queryClient.ts, app.config.ts (constantes)
├── features/              # Domaines auto-contenus (api/ hooks/ types/ components/)
│   ├── auth/              #   connexion, inscription
│   ├── catalog/           #   menus par restaurant + gestion franchisé
│   ├── orders/            #   commandes, checkout, statuts
│   ├── profile/           #   profil et adresses
│   ├── reservations/      #   réservations client et restaurant
│   ├── restaurants/       #   liste des restaurants
│   ├── stock/             #   stocks et réapprovisionnement
│   └── suppliers/         #   fournisseurs
├── layouts/               # StorefrontLayout (client), PortalLayout (franchisé)
├── pages/                 # Écrans routés
├── services/
│   └── http.ts            # SEUL point d'accès réseau (client fetch + Bearer)
├── store/                 # authStore (session), cartStore (panier) — Zustand persisté
├── types/                 # Types partagés
└── utils/                 # Formatage (prix, dates)
```

### Règle d'architecture

**Aucun composant de `pages/` ou `components/` ne fait d'appel réseau ni ne porte
de logique métier.** Le flux est toujours :

```
page/composant → hook (TanStack Query) → api/ du feature → services/http
```

L'état global (session, panier) passe par les stores Zustand.

---

## Fonctionnalités

### Storefront client
- **Inscription** et **connexion** (comptes de démonstration en un clic)
- **Parcourir les restaurants** — page d'accueil façon Uber Eats
- **Consulter le menu du restaurant choisi**, filtrable par catégorie (catégories
  déduites dynamiquement des données)
- **Panier lié à un seul restaurant** : ajouter un plat d'un autre restaurant
  réinitialise le panier (comportement Uber Eats)
- **Commander** : adresse de livraison, paiement Stripe (mode test), confirmation
- **Historique des commandes** avec **suivi visuel des étapes** (confirmée →
  préparation → prête → en livraison → livrée)
- **Réserver une table** : restaurant, date/heure, couverts — puis suivi et
  annulation de ses réservations
- **Profil** : identité (prénom, nom, téléphone) et **adresses de livraison**
  (ajout, suppression, adresse par défaut)

### Portail franchisé
- **Tableau de bord** : chiffre d'affaires, nombre de commandes, panier moyen,
  articles sous seuil, demandes de réappro en attente
- **Gestion des menus** : créer, modifier, supprimer un article, le rendre
  indisponible
- **Gestion des stocks** : entrées et sorties, alertes de seuil
- **Réapprovisionnement** : suivi des demandes (les automatiques sont signalées)
- **Commandes** : démarrer la préparation, marquer comme prête
- **Réservations** : confirmer, installer, annuler, marquer non honorée
- **Fournisseurs** : ajouter, lister, supprimer

Le portail n'est accessible qu'aux comptes ayant le rôle `manager` (garde de route
`RequireRole`).

---

## Routage réseau

Le front appelle la base API définie par `VITE_API_BASE_URL`. En production,
la valeur par défaut pointe vers `https://api.c-mbk.fr`. En développement, le
front conserve l'origine courante et passe par le proxy Vite pour rejoindre les
services locaux.

Les routes backend suivent les préfixes ci-dessous :

| Chemin | Service |
|---|---|
| `/api/auth`, `/api/user/`, `/api/admin`, `/api-docs`, `/scalar`, `/health` | auth-service (8081) |
| `/api/users` | user-service (8087) |
| `/api/restaurants`, `/api/franchise` | franchise-service (8089) |
| `/api/menu` | menu-service (8085) |
| `/api/orders` | order-service (8082) |
| `/api/stocks`, `/api/replenishment-requests` | stock-service (8083) |
| `/api/deliveries`, `/tracking` (WebSocket) | delivery-service (8084) |
| `/api/reservations` | reservation-service (8088) |

> ⚠️ **Attention** : `/api/user` (auth) est un préfixe de `/api/users`
> (user-service). Les proxies locaux doivent garder cette priorité pour éviter
> que les profils partent vers le mauvais service.

### Configuration locale

Crée un fichier `.env.local` si tu veux forcer une autre base API pendant le
développement :

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Si tu lances le front en conteneur ou derrière un reverse proxy local, adapte la
valeur à l'URL exposée par ton gateway.

---

## Dépendances

> **Légende** — 🔴 indispensable (le service ne démarre pas ou ne sert à rien) ·
> 🟠 nécessaire à une fonctionnalité (le reste continue de marcher) ·
> 🟡 optionnelle (dégradation silencieuse, journalisée)

Le front n'a **aucune base de données** : il consomme les API des services via
nginx. Chaque service manquant ne casse que les écrans qui en dépendent.

| Service | Type | Conséquence si absent |
|---|---|---|
| **auth-service** | 🔴 | Impossible de se connecter ou de s'inscrire |
| **franchise-service** | 🔴 | Page d'accueil vide (liste des restaurants) et pages Fournisseurs cassées |
| **menu-service** | 🟠 | Menus indisponibles (client et gestion franchisé) — on ne peut plus commander |
| **order-service** | 🟠 | Commandes, checkout et écrans de suivi cassés |
| **payment-service** | 🟠 | Le bouton « Payer » échoue ; la navigation reste utilisable |
| **stock-service** | 🟠 | Pages Stocks et Réapprovisionnement cassées, 2 indicateurs du tableau de bord vides |
| **reservation-service** | 🟡 | Seules les pages Réservations sont cassées |
| **user-service** | 🟡 | Seule la page Profil est cassée |
| **delivery-service** | 🟢 | Aucun impact : pas encore d'écran de livraison |

**Minimum pour une démonstration client** : `auth` + `franchise` + `menu` +
`order` + `payment`.

---

## Lancement

### En conteneur (recommandé — reste disponible en permanence)

```bash
docker network create microservices-net   # une seule fois, partagé
docker compose up -d --build
```

### En développement (rechargement à chaud)

```bash
npm install
npm run dev          # http://localhost:3000
```

Dans les deux cas, **les services backend doivent tourner** (voir le README racine).

### Autres commandes

```bash
npm run build        # Vérification des types + build de production
npm run lint         # ESLint
```

---

## Charte graphique

Définie en tokens Tailwind v4 (`src/index.css`) :

| Élément | Valeur |
|---|---|
| Vert foncé (primaire) | `#004430` |
| Jaune moutarde (accent) | `#FFCC00` |
| Fond storefront | `#FAF7F0` |
| Police titres | Montserrat |
| Police texte | Open Sans |

---

## Ce qui manque

> ⚠️ **Aucune CI n'est configurée sur ce projet.**

- **Aucun test automatisé** (ni Vitest ni Testing Library) — c'est le seul projet
  du dépôt sans tests
- Pas d'écran d'**historique des paiements** (l'endpoint existe côté
  `payment-service`)
- Pas d'écran de **création de restaurant** pour le siège (l'endpoint existe côté
  `franchise-service`)
