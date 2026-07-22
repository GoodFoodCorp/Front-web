# Web App

Front-end React + TypeScript de Good Food 3.0 : **storefront client**
(catalogue, panier, checkout Stripe test, suivi de commande) et **portail
franchisé** (tableau de bord, stocks, réapprovisionnement, commandes).

Créée avec `npm create vite@latest -- --template react-ts`.

## Stack

Vite · React 19 + TypeScript strict · Tailwind CSS v4 (thème = charte Good Food)
· TanStack Query (données serveur) · Zustand (session + panier, persistés) ·
React Router · lucide-react · shadcn-style UI maison.

## Architecture (séparation stricte des couches)

```
src/
├── app/            # App.tsx (racine), providers.tsx (QueryClient + Router),
│                   #   router.tsx (table de routes)
├── assets/
├── components/     # UI pure, un dossier par composant (Button/, Card/, Badge/,
│                   #   Input/, Spinner/, EmptyState/, RequireRole/)
├── config/         # queryClient.ts, app.config.ts (constantes non secrètes)
├── features/       # Domaines auto-contenus :
│   ├── auth/       #   api/ hooks/ types/
│   ├── catalog/    #   api/ hooks/ types/ utils/  (menu DYNAMIQUE via /api/menu)
│   ├── orders/     #   api/ hooks/ types/ components/
│   └── stock/      #   api/ hooks/ types/
├── hooks/          # Hooks transverses (useTenants)
├── layouts/        # StorefrontLayout, PortalLayout
├── pages/          # Écrans routés (composants « bêtes » : props in, JSX out)
├── services/       # http.ts — SEUL point d'accès réseau (client + Bearer)
├── store/          # État global Zustand : authStore (session), cartStore (panier)
├── types/          # Types partagés (Tenant, Profile)
└── utils/          # Helpers (formatPrice, formatDateTime)
```

**Règle respectée** : aucun composant `.tsx` de `pages/` ou `components/` ne fait
d'appel réseau ni ne porte de logique métier. Tout passe par les `hooks/` (qui
appellent les `api/` → `services/http`) et les `store/`.

**Catalogue dynamique** : le menu n'est plus un tableau statique — il vient de
`GET /api/menu` (order-service, table `menu_items` seedée), via
`features/catalog/`. Les catégories sont dérivées des données reçues.

## Lancement

### Dev (avec les services backend en local)

```bash
npm install
npm run dev          # http://localhost:3000
```

Le proxy Vite ([vite.config.ts](vite.config.ts)) route `/api/*` et `/tracking`
vers les 4 services (ports 8081-8084) — le navigateur ne parle qu'à son origine,
zéro CORS. Il faut donc que les services tournent (`docker compose up` dans
chacun de leurs dossiers).

### Production (image nginx)

```bash
docker network create microservices-net   # une fois
docker compose up -d --build               # http://localhost:3000
```

nginx sert le build statique et proxifie vers les services par nom de conteneur
sur le réseau partagé ([nginx.conf](nginx.conf)) — même contrat que l'ingress K8s.

## Comptes de démonstration

Boutons pré-remplis sur l'écran de connexion :

| Rôle | Accès |
|---|---|
| Client (`user@example.com`) | Storefront : commander, payer, suivre |
| Franchisé (`manager@example.com`) | Portail : dashboard, stocks, réappro, commandes |

## Parcours couverts (cahier des charges §4.2)

- **Passer une commande** : catalogue → panier → choix restaurant + adresse →
  paiement Stripe (mode test, via `useCheckout` : create → payment-intent →
  confirm) → confirmation + timeline de suivi.
- **Gestion des stocks** : consultation, mouvements IN/OUT/ADJUSTMENT, création
  d'article, badge « sous seuil ».
- **Réapprovisionnement** : liste des demandes (dont les auto-générées), suivi
  du statut (avancement réservé au siège/admin).

## Build & qualité

```bash
npm run build        # tsc -b && vite build
npm run lint         # ESLint (config Vite react-ts)
```
