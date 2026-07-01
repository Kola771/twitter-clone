# Twitter / X Clone

Clone full stack de Twitter/X développé pour portfolio. L'application reproduit les fonctionnalités essentielles de la plateforme : fil d'actualité, tweets, likes, retweets, réponses, système d'abonnement, notifications, upload de médias et picker d'emojis/GIFs.

---

## Aperçu

| Page | Description |
|------|-------------|
| `/login` `/register` | Authentification JWT avec validation côté client |
| `/home` | Fil d'actualité des tweets |
| `/explore` | Recherche de tweets et d'utilisateurs |
| `/notifications` | Notifications (likes, retweets, réponses, abonnements) |
| `/profile/:username` | Profil utilisateur avec bannière, avatar, stats |
| `/tweet/:id` | Détail d'un tweet avec ses réponses |

---

## Stack technique

### Frontend — `twitter-clone-frontend/`

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.2.9 | Framework React avec App Router et Turbopack |
| **React** | 19 | Interface utilisateur |
| **TypeScript** | 5 | Typage statique |
| **TailwindCSS** | 4 | Styles utilitaires, thème sombre |
| **Zustand** | 5 | Gestion d'état global (auth) avec persistance localStorage |
| **TanStack Query** | 5 | Fetch, cache et synchronisation des données serveur |
| **Axios** | 1 | Client HTTP avec intercepteurs JWT et refresh automatique |
| **React Hook Form** | 7 | Gestion des formulaires |
| **Zod** | 4 | Validation des schémas côté client |
| **@hookform/resolvers** | 5 | Intégration Zod ↔ React Hook Form |

### Backend — `twitter-clone-backend/`

| Technologie | Version | Rôle |
|-------------|---------|------|
| **NestJS** | 11 | Framework Node.js modulaire |
| **Prisma** | 5.22 | ORM — modélisation et accès à la base de données |
| **PostgreSQL** | 17 | Base de données relationnelle |
| **PassportJS** | — | Stratégies d'authentification |
| **JWT** | — | Tokens d'accès (15 min) + refresh (7 jours) |
| **Bcrypt** | — | Hachage des mots de passe |
| **Cloudinary** | 2 | Stockage et transformation des médias (images/vidéos) |
| **Multer** | 2 | Parsing multipart/form-data en mémoire |
| **class-validator** | — | Validation des DTOs NestJS |
| **class-transformer** | — | Transformation des objets entrants |
| **Swagger** | — | Documentation API auto-générée sur `/api/docs` |
| **@nestjs/config** | — | Gestion des variables d'environnement |

### APIs externes

| Service | Utilisation |
|---------|-------------|
| **Cloudinary** | Upload et hébergement des images et vidéos des tweets |
| **Giphy API** | Recherche et insertion de GIFs animés dans les tweets |

---

## Architecture

```
twitter-clone/
├── twitter-clone-frontend/        # Application Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # Layout et pages login / register
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── (main)/            # Layout principal avec sidebar
│   │   │       ├── home/          # Fil d'actualité
│   │   │       ├── explore/       # Recherche
│   │   │       ├── notifications/ # Notifications
│   │   │       ├── profile/[username]/
│   │   │       └── tweet/[id]/    # Détail tweet + réponses
│   │   ├── components/
│   │   │   ├── auth/              # LoginForm, RegisterForm
│   │   │   ├── layout/            # Sidebar, MobileNav, RightPanel
│   │   │   ├── tweet/             # TweetCard, TweetForm, TweetList,
│   │   │   │                      # TweetActions, ReplyModal, StickerPicker
│   │   │   ├── ui/                # Button, Input, Avatar, Spinner
│   │   │   └── user/              # EditProfileModal, FollowButton
│   │   ├── hooks/                 # useAuth, useTweets, useUsers
│   │   ├── lib/                   # axios.ts, query.ts, utils.ts
│   │   ├── store/                 # authStore.ts (Zustand)
│   │   ├── types/                 # auth.ts, tweet.ts, user.ts
│   │   └── proxy.ts               # Protection des routes (remplace middleware.ts)
│   ├── next.config.ts
│   └── .env.example
│
└── twitter-clone-backend/         # API NestJS
    ├── src/
    │   ├── auth/                  # Login, register, refresh token
    │   ├── users/                 # Profil, mise à jour
    │   ├── tweets/                # CRUD tweets + réponses
    │   ├── likes/                 # Like / unlike
    │   ├── retweets/              # Retweet / unretweet
    │   ├── follows/               # Follow / unfollow
    │   ├── notifications/         # Notifications
    │   ├── upload/                # Upload Cloudinary
    │   ├── prisma/                # Service Prisma
    │   └── common/                # Guards, décorateurs
    ├── prisma/
    │   ├── schema.prisma          # Modèles BDD
    │   └── seed.ts                # Données de test
    └── .env.example
```

---

## Fonctionnalités

### Authentification
- Inscription avec username, nom, email et mot de passe
- Connexion avec génération d'un access token (15 min) et d'un refresh token (7 jours)
- Refresh automatique des tokens côté frontend via intercepteur Axios
- Protection des routes via `proxy.ts` (Next.js 16)
- Persistance de la session dans le localStorage via Zustand

### Tweets
- Création de tweets avec texte (280 caractères max)
- Suppression de ses propres tweets
- Affichage du fil d'actualité (tweets sans réponses)
- Compteur de likes, retweets et réponses

### Médias
- Upload d'images (JPG, PNG, GIF, WebP) et vidéos (MP4, MOV) via Cloudinary
- Limite de 50 Mo par fichier
- Aperçu local avant envoi
- Les GIFs animés s'affichent à leur taille naturelle (pas en pleine largeur)
- Les vidéos sont lues directement dans le fil

### Sticker Picker
- **Onglet Emoji** : 8 catégories (Smileys, Gestes, Cœurs, Animaux, Nourriture, Sports, Symboles, Voyage)
- Insertion de l'emoji à la position du curseur dans le textarea
- **Onglet GIF** : recherche en temps réel via l'API Giphy, trending par défaut
- Sélection d'un GIF l'insère comme média du tweet
- Envoi possible sans texte (GIF ou image seul)

### Interactions
- Like / unlike avec mise à jour optimiste
- Retweet / unretweet
- Réponses imbriquées avec modal dédié
- Navigation vers le thread complet après réponse

### Profil
- Bannière, avatar, nom, bio
- Modification du profil (PATCH `/users/me`)
- Stats : tweets, abonnés, abonnements
- Bouton Follow / Unfollow

### Navigation
- **Desktop** : sidebar fixe à gauche avec liens de navigation
- **Mobile** : barre de navigation fixe en bas de l'écran
- Responsive sur tous les formats

### Notifications
- Notification à chaque like, retweet, réponse et nouvel abonné
- Compteur de notifications non lues
- Marquage comme lu

### Explore
- Recherche de tweets par mots-clés
- Recherche d'utilisateurs par username ou nom

---

## Installation et démarrage

### Prérequis
- Node.js 22+
- PostgreSQL 17
- Comptes Cloudinary et Giphy (plans gratuits suffisants)

### Backend

```bash
cd twitter-clone-backend
npm install

# Copier et remplir les variables d'environnement
cp .env.example .env
```

Variables à renseigner dans `.env` :

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/twitter_clone"
JWT_SECRET="votre_secret_jwt"
JWT_REFRESH_SECRET="votre_secret_refresh"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
PORT=3001
```

```bash
# Créer les tables
npx prisma db push

# Insérer les données de test (alice / bob)
npx ts-node prisma/seed.ts

# Démarrer en mode développement
npm run start:dev
```

L'API est accessible sur `http://localhost:3001`.  
La documentation Swagger est disponible sur `http://localhost:3001/api/docs`.

### Frontend

```bash
cd twitter-clone-frontend
npm install

# Copier et remplir les variables d'environnement
cp .env.example .env.local
```

Variables à renseigner dans `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GIPHY_API_KEY=votre_cle_giphy
```

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### Comptes de test

| Email | Mot de passe | Username |
|-------|-------------|----------|
| alice@example.com | Password1 | alice |
| bob@example.com | Password1 | bob |

---

## Points techniques notables

- **Next.js 16** : `middleware.ts` est déprécié — le fichier de protection des routes s'appelle `proxy.ts` avec `export default function proxy()`
- **TanStack Query v5** : `invalidateQueries` prend un objet `{ queryKey: [...] }` (plus de surcharge par string)
- **Prisma 5** : utilisé à la place de Prisma 7 (breaking change sur la config `datasource`)
- **Zustand 5** : la prop de persistance partielle s'appelle `partialize` (pas `partialState`)
- **Cloudinary v2** : upload via stream avec `upload_stream` pour compatibilité Multer `memoryStorage`
- **GIFs Giphy** : affichés avec `<img>` natif (pas `next/image`) pour préserver l'animation
- **Refresh token** : stratégie Passport lit le token depuis le body (`fromBodyField('refreshToken')`)

---

## Roadmap

- [x] Authentification JWT complète
- [x] CRUD tweets avec fil d'actualité
- [x] Likes, retweets, réponses
- [x] Système d'abonnement
- [x] Notifications
- [x] Explore / Recherche
- [x] Upload médias (Cloudinary)
- [x] Picker emoji + GIF (Giphy)
- [x] Navigation responsive (desktop + mobile)
- [x] Modification de profil
- [ ] Déploiement (Vercel + Railway/Render)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Messages directs
