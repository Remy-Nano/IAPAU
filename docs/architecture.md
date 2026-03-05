# Architecture du projet

> Dernière mise à jour: 2026-02-13

## 1) Vue globale

```text
┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                        │
│  Pages App Router + composants UI + AuthContext + clients API       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTP (fetch)
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (/api/*)                        │
│  Route Handlers (App Router) + middleware JWT + validation Zod      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ appels métier
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    COUCHE MÉTIER (controllers/services)             │
│  authController, conversationService, userService, importService…   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ Mongoose
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         DONNÉES (MongoDB)                           │
│  models: User, Conversation, Hackathon, Evaluation                  │
└──────────────────────────────────────────────────────────────────────┘
```

## 2) Architecture dossier (simplifiée)

```text
src/
├── app/
│   ├── (frontend)/              # Pages UI (login, dashboards, etc.)
│   └── (backend)/api/           # Endpoints API
├── components/                  # Composants React UI
├── context/                     # AuthContext (état de connexion)
├── lib/
│   ├── client/                  # Clients API côté front
│   ├── controllers/             # Orchestration des cas d'usage
│   ├── services/                # Logique métier
│   ├── models/                  # Schémas Mongoose
│   ├── utils/                   # Utilitaires
│   ├── ai-service.ts            # Intégration OpenAI/Mistral
│   └── mongoose.ts              # Connexion DB
└── types/                       # Types TypeScript
```

## 3) Flux clés

### 3.1 Authentification

```text
Frontend AuthManager/AuthContext
        │
        ├─ POST /api/auth/login
        │     ├─ étudiant: magic link
        │     └─ admin/examinateur: rôle ou credentials
        │
        ├─ POST /api/auth/credentials
        │     └─ authController (bcrypt + JWT)
        │
        └─ GET /api/auth/magic-link/verify
              └─ vérifie token, invalide magicLink, renvoie JWT session
```

### 3.2 Conversations IA

```text
ChatInterface
   │
   ├─ POST /api/conversations
   ├─ POST /api/conversations/[id]/messages
   ├─ POST /api/conversations/[id]/ai-response -> ai-service (OpenAI/Mistral)
   └─ PATCH /api/conversations/[id]/final
```

### 3.3 Administration

```text
AdminDashboard
   │
   ├─ /api/users (+ /[id], /import)
   ├─ /api/hackathons (+ /[id])
   └─ /api/evaluations* (lecture selon rôle/contexte)
```

## 4) Sécurité (résumé)

- `middleware.ts` protège `/api/*` (sauf routes publiques: `/api/auth`, `/api/health`).
- JWT signé avec `JWT_SECRET`.
- Mots de passe stockés hashés (`bcryptjs`).
- Magic link étudiant avec expiration et invalidation après usage.

## 5) Dépendances techniques majeures

- Frontend/API: Next.js 15 + React 19 + TypeScript.
- Données: MongoDB + Mongoose.
- Validation: Zod.
- IA: OpenAI + Mistral.
- Email magic link: SMTP (Nodemailer).

## 6) Variables d’environnement critiques

- `MONGODB_URI`
- `JWT_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY`
- `MISTRAL_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
