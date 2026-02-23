# Mémoire Vive

**Plateforme d'hommage aux journalistes disparus en Afrique de l'Ouest.**

Une galerie interactive combinant une carte géographique et des portraits rotatifs pour honorer la mémoire de ceux qui ont sacrifié leur vie pour informer.

![Aperçu](https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop)

---

## 🎯 Fonctionnalités

### Site public
- **Carte interactive** (Mapbox) avec marqueurs par pays
- **Galerie de portraits** avec rotation automatique (9 visibles, changement toutes les 4s)
- **Effet grayscale → couleur** au survol des portraits
- **Filtrage par pays** en cliquant sur la carte
- **Design mémoriel** : thème sombre, accent doré, bougie animée

### Panneau admin
- **Authentification** Firebase (email/mot de passe)
- **Gestion des journalistes** : créer, éditer, supprimer, publier/dépublier
- **Gestion des pays** : coordonnées, niveau de risque, description
- **Upload de photos** vers Firebase Storage

---

## 🏗️ Architecture

```
memoire-vive/
├── apps/
│   ├── web/                    # Site public (Astro)
│   │   ├── src/
│   │   │   ├── components/     # Header, Map, Gallery, PortraitCard
│   │   │   ├── layouts/        # Layout principal
│   │   │   ├── pages/          # Page d'accueil
│   │   │   ├── lib/            # Client Firebase
│   │   │   └── styles/         # CSS global + Tailwind
│   │   └── package.json
│   │
│   └── admin/                  # Panneau admin (Refine + React)
│       ├── src/
│       │   ├── providers/      # Data + Auth providers Firebase
│       │   ├── resources/      # CRUD Journalistes + Pays
│       │   ├── pages/          # Login
│       │   └── App.tsx         # Configuration Refine
│       └── package.json
│
├── packages/
│   └── shared/                 # Types TypeScript partagés
│       └── types.ts
│
└── firebase/                   # Règles de sécurité
    ├── firestore.rules
    ├── firestore.indexes.json
    └── storage.rules
```

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| Site public | **Astro 4** |
| Styles | **Tailwind CSS** |
| Carte | **Mapbox GL JS** |
| Admin | **Refine** + **Ant Design** |
| Base de données | **Firebase Firestore** |
| Authentification | **Firebase Auth** |
| Stockage photos | **Firebase Storage** |

---

## 📋 Prérequis

- **Node.js** 18 ou supérieur
- **Compte Firebase** (gratuit)
- **Compte Mapbox** (gratuit, pour le token API)

---

## 🚀 Installation

### 1. Cloner le projet

```bash
# Si téléchargé en ZIP, extraire puis :
cd memoire-vive
```

### 2. Installer les dépendances

```bash
# Site public
cd apps/web
npm install

# Panneau admin
cd ../admin
npm install
```

### 3. Configurer Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet
3. Activer **Firestore Database** (mode production)
4. Activer **Authentication** → Email/Password
5. Activer **Storage**
6. Aller dans ⚙️ Paramètres du projet → copier les credentials

### 4. Configurer les variables d'environnement

**Site public** (`apps/web/.env`) :
```env
PUBLIC_FIREBASE_API_KEY=votre-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre-sender-id
PUBLIC_FIREBASE_APP_ID=votre-app-id

PUBLIC_MAPBOX_TOKEN=pk.votre-token-mapbox
```

**Admin** (`apps/admin/.env`) :
```env
VITE_FIREBASE_API_KEY=votre-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre-sender-id
VITE_FIREBASE_APP_ID=votre-app-id
```

### 5. Obtenir un token Mapbox

1. Créer un compte sur [mapbox.com](https://www.mapbox.com)
2. Aller dans Account → Tokens
3. Copier le token public par défaut

### 6. Déployer les règles Firebase

```bash
# Installer Firebase CLI si nécessaire
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser (sélectionner le projet)
cd firebase
firebase init

# Déployer les règles
firebase deploy --only firestore:rules,storage:rules
```

### 7. Créer un administrateur

Dans la console Firebase → Firestore :

1. Créer la collection `admins`
2. Ajouter un document avec :
   - **Document ID** : l'UID de l'utilisateur (visible dans Authentication)
   - **Champ** : `role` = `"admin"`

---

## 💻 Développement

### Lancer le site public

```bash
cd apps/web
npm run dev
# → http://localhost:4321
```

### Lancer le panneau admin

```bash
cd apps/admin
npm run dev
# → http://localhost:5173
```

---

## 🌐 Déploiement

### Site public (Vercel)

```bash
cd apps/web
npm run build
# Déployer le dossier dist/ sur Vercel
```

Ou connecter le repo GitHub à Vercel avec :
- **Framework** : Astro
- **Root Directory** : `apps/web`

### Admin (Firebase Hosting)

```bash
cd apps/admin
npm run build

# Dans firebase/firebase.json, configurer le hosting
firebase deploy --only hosting
```

---

## 📊 Structure des données

### Collection `journalists`

```typescript
{
  id: string;              // Auto-généré
  name: string;            // "Amadou Diallo"
  countryId: string;       // "mali"
  countryName: string;     // "Mali" (dénormalisé)
  role: string;            // "Reporter d'investigation"
  yearOfDeath: number;     // 2023
  photoUrl: string;        // URL Firebase Storage ou externe
  bio?: string;            // Biographie optionnelle
  placeOfDeath?: string;   // "Tombouctou, Mali"
  circumstances?: string;  // Circonstances
  isPublished: boolean;    // Visible sur le site public
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection `countries`

```typescript
{
  id: string;              // "mali"
  name: string;            // "Mali"
  code: string;            // "ML" (ISO 3166-1)
  coords: {
    lat: number;           // 17.57
    lng: number;           // -4.0
  };
  description: string;     // Contexte liberté de la presse
  riskLevel: string;       // "high" | "critical" | "extreme"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection `admins`

```typescript
{
  // Document ID = UID Firebase Auth
  role: "admin";
}
```

---

## 🎨 Personnalisation

### Couleurs (Tailwind)

Modifier `apps/web/tailwind.config.js` :

```javascript
colors: {
  deep: '#0a0a0a',      // Fond principal
  card: '#141414',      // Fond cartes
  primary: '#f5f5f0',   // Texte principal
  muted: '#8a8a85',     // Texte secondaire
  accent: '#c4a77d',    // Accent doré
}
```

### Polices

Le projet utilise Google Fonts :
- **Cormorant Garamond** : titres (serif élégant)
- **DM Sans** : corps de texte (sans-serif moderne)

---

## 📝 Licence

MIT

---

## 🙏 Crédits

- Photos de démonstration : [Unsplash](https://unsplash.com)
- Icônes : Emoji natifs
- Framework admin : [Refine](https://refine.dev)
- UI Components : [Ant Design](https://ant.design)

---

**En mémoire de ceux qui ont osé dire la vérité.**
