# 🚀 **Prompt Challenge Platform**

_Plateforme d'évaluation IA pour hackathons - Architecture Next.js/MERN avec Domain-Driven Design_

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-000000?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 **Table des matières**

1. [Vue d'ensemble](#-vue-densemble)
2. [Architecture du projet](#-architecture-du-projet)
3. [Fonctionnalités implémentées](#-fonctionnalités-implémentées)
4. [Démarrage rapide](#-démarrage-rapide)
5. [Configuration](#-configuration)
6. [Bonnes pratiques appliquées](#-bonnes-pratiques-appliquées)
7. [Guide de contribution](#-guide-de-contribution)
8. [Évolutions futures](#-évolutions-futures)

---

## 🎯 **Vue d'ensemble**

**Prompt Challenge** est une solution complète d'évaluation et de notation pour hackathons utilisant l'intelligence artificielle. La plateforme permet aux jurys d'évaluer les conversations entre étudiants et différents modèles d'IA (OpenAI, Mistral) de manière structurée et transparente.

### **Stack technique actuelle**

- **Frontend** : Next.js 15.3.1, React 19, TypeScript 5, Tailwind CSS 4
- **Backend** : Next.js API Routes, Mongoose 8.14.1, MongoDB Atlas
- **UI/UX** : ShadCN/ui (style New York), Radix UI, Lucide React 0.507.0
- **IA** : OpenAI 4.97.0, Mistral AI 1.6.0
- **Auth** : JWT, bcrypt, Magic Links via SendGrid 8.1.5
- **Validation** : Zod 3.25.55, React Hook Form 7.56.3
- **Tooling** : ESLint 9, Turbopack, file-loader

---

## 🏗️ **Architecture du projet**

### **Structure des dossiers actuelle**

```
prompt-challenge/
├── 📁 src/
│   ├── 📁 app/                    # Pages & API Routes (Next.js 15+)
│   │   ├── 📁 api/               # Routes API backend
│   │   │   ├── auth/             # Authentification (login, magic-link)
│   │   │   ├── users/            # CRUD utilisateurs + import CSV
│   │   │   ├── conversations/    # Gestion conversations IA
│   │   │   ├── evaluations/      # Système d'évaluation jurys
│   │   │   ├── hackathons/       # Gestion hackathons
│   │   │   └── health/           # Health check API
│   │   ├── 📁 admin/             # Interface administration
│   │   │   └── users/            # Gestion utilisateurs (CRUD, import)
│   │   ├── 📁 dashboard/         # Tableaux de bord par rôle
│   │   │   ├── admin/            # Dashboard administrateur
│   │   │   ├── examiner/         # Dashboard examinateur/jury
│   │   │   └── student/          # Dashboard étudiant
│   │   ├── 📁 login/             # Pages authentification
│   │   ├── 📁 magic-link/        # Vérification magic links
│   │   └── 📁 version-finale/    # Soumission finale étudiants
│   ├── 📁 components/            # Composants React organisés par domaine
│   │   ├── 📁 ui/               # 15 composants ShadCN/ui
│   │   ├── 📁 auth/             # 8 composants authentification
│   │   ├── 📁 admin/            # Composants administration
│   │   ├── 📁 chat/             # Interface conversation IA (11 composants)
│   │   ├── 📁 student/          # Interface étudiants
│   │   └── 📁 examiner/         # Interface jurys
│   ├── 📁 lib/                   # Logique backend et services
│   │   ├── 📁 models/           # 4 modèles Mongoose (User, Conversation, etc.)
│   │   ├── 📁 services/         # 4 services métier
│   │   ├── 📁 controllers/      # 4 contrôleurs HTTP
│   │   ├── 📁 utils/            # Utilitaires (email, roles, messages)
│   │   ├── 📁 client/           # Services client-side
│   │   ├── ai-service.ts        # Service IA unifié OpenAI/Mistral
│   │   ├── config.ts            # Configuration globale
│   │   └── mongoose.ts          # Connexion MongoDB optimisée
│   ├── 📁 services/             # Services frontend (hackathonService)
│   ├── 📁 types/                # Types TypeScript partagés
│   └── 📁 context/              # Contexte React (AuthContext)
├── 📁 public/                   # Assets statiques + templates CSV
├── 📁 middleware.ts             # Middleware Next.js
└── 📄 Configuration files       # Next.js, TypeScript, ESLint, etc.
```

---

## ✅ **Fonctionnalités implémentées**

### **🔐 Système d'authentification**

- **Multi-rôle** : étudiants, examinateurs, administrateurs
- **Magic Links** : authentification sans mot de passe pour étudiants
- **Authentification classique** : email/mot de passe pour jurys et admins
- **JWT sécurisé** : tokens avec expiration (10 minutes pour magic links)
- **Auto-création** : utilisateurs de test prédéfinis

### **👥 Gestion des utilisateurs**

- **CRUD complet** : création, lecture, modification, suppression
- **Import CSV** : import en masse via templates
- **Validation Zod** : validation robuste des données
- **Hachage bcrypt** : sécurisation des mots de passe
- **Profils détaillés** : étudiants et jurys avec métadonnées

### **🤖 Services IA**

- **OpenAI GPT-3.5** : intégration complète avec gestion tokens
- **Mistral AI** : support Mistral Medium
- **Service unifié** : interface commune pour tous les modèles
- **Gestion d'historique** : conversations multi-tours
- **Paramètres configurables** : température, max tokens, etc.

### **💬 Interface de conversation**

- **Chat temps réel** : interface moderne et responsive
- **Sélection de modèle** : choix OpenAI/Mistral
- **Contrôles avancés** : température, tokens, types de prompts
- **Historique** : sauvegarde et restauration des conversations
- **Statistiques** : compteurs de tokens et métriques

### **📊 Système d'évaluation**

- **Grilles d'évaluation** : critères standardisés
- **Interface jury** : évaluation des conversations étudiants
- **Commentaires** : feedback détaillé
- **Gestion des hackathons** : organisation par événements

### **⚙️ Administration**

- **Dashboard admin** : vue d'ensemble complète
- **Gestion centralisée** : utilisateurs, hackathons, évaluations
- **Import/Export** : outils de gestion en masse
- **Monitoring** : health checks et métriques

---

## 🏃‍♂️ **Démarrage rapide**

### **Prérequis**

- Node.js 18+
- MongoDB Atlas (ou instance locale)
- Clés API : OpenAI + Mistral + SendGrid

### **Installation**

```bash
# 1. Cloner et installer
git clone <repository-url>
cd prompt-challenge
npm install

# 2. Configuration environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# 3. Lancer en développement
npm run dev
```

### **Accès**

- **Application** : http://localhost:3000
- **Comptes de test** :
  - Étudiant : `matheoalves030@gmail.com` (magic link)
  - Examinateur : `pierre.durand@example.fr` / `examiner123`
  - Admin : `admin@example.com` / `admin123`

---

## ⚙️ **Configuration**

### **Variables d'environnement (.env.local)**

```bash
# Base de données
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# Authentification
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=http://localhost:3000

# Services IA
OPENAI_API_KEY=sk-your-openai-api-key
MISTRAL_API_KEY=your-mistral-api-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

### **Scripts disponibles**

```bash
# Développement avec Turbopack
npm run dev

# Build de production
npm run build
npm start

# Linting
npm run lint
```

---

## ✨ **Bonnes pratiques appliquées**

### **1. Domain-Driven Design (DDD)**

Organisation par domaines métier avec séparation claire des responsabilités :

```typescript
// Exemple : Domaine "Users"
/src/components/admin/users/     # UI spécifique
/src/lib/services/userService.ts # Logique métier
/src/lib/models/user.ts          # Modèle de données
/src/types/userValidation.ts     # Validation
```

### **2. Type Safety avec TypeScript**

- **Interfaces partagées** entre frontend et backend
- **Validation Zod** stricte des données
- **Types centralisés** dans `/src/types/`

### **3. Architecture API moderne**

- **RESTful** avec Next.js API Routes
- **Gestion d'erreurs** structurée avec codes HTTP
- **Middleware** pour l'authentification
- **Services** découplés des contrôleurs

### **4. Sécurité robuste**

- **Hachage bcrypt** (salt rounds: 10)
- **JWT avec expiration** contrôlée
- **Validation Zod** côté serveur
- **Variables d'environnement** sécurisées

### **5. UI/UX moderne**

- **ShadCN/ui** : composants accessibles et customisables
- **Responsive design** : mobile-first
- **Dark mode ready** : variables CSS préparées
- **Feedback utilisateur** : toasts et loading states

---

## 🛠️ **Guide de contribution**

### **Standards de code**

- **ESLint** : configuration Next.js stricte
- **TypeScript strict** : mode strict activé
- **Imports absolus** : utiliser `@/` pour les imports
- **Named exports** : préférés aux default exports

### **Structure des commits**

```bash
feat: ajouter service Claude AI
fix: corriger validation email
docs: mettre à jour README
refactor: optimiser connexion MongoDB
```

### **Développement de nouvelles fonctionnalités**

1. **Types** : définir dans `/src/types/`
2. **Services** : logique métier dans `/src/lib/services/`
3. **API** : routes dans `/src/app/api/`
4. **UI** : composants dans `/src/components/{domain}/`

---

## 🚀 **Évolutions futures**

### **🎯 Court terme**

- [ ] **Tests** : Jest + React Testing Library
- [ ] **Nouvelles IA** : Claude, Gemini, Llama
- [ ] **Monitoring** : Winston + métriques API
- [ ] **Cache** : Redis pour les performances
- [ ] **Docker** : containerisation complète

### **🔮 Moyen terme**

- [ ] **WebSockets** : conversations temps réel
- [ ] **Analytics** : dashboard métriques avancées
- [ ] **Mobile** : Progressive Web App
- [ ] **Multi-tenant** : support multiple organisations
- [ ] **API publique** : endpoints REST documentés

### **📈 Long terme**

- [ ] **Microservices** : découpage par domaines
- [ ] **Kubernetes** : orchestration cloud
- [ ] **Machine Learning** : évaluation automatique
- [ ] **Blockchain** : certification des évaluations

---

## 📚 **Ressources**

### **Documentation technique**

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [ShadCN/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Mongoose ODM](https://mongoosejs.com/)

### **APIs intégrées**

- [OpenAI API](https://platform.openai.com/docs)
- [Mistral AI API](https://docs.mistral.ai/)
- [SendGrid API](https://docs.sendgrid.com/)

### **Outils de développement**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

---

**💡 Questions ou contributions ?** Contactez l'équipe via les issues GitHub ou par email.

---

_Dernière mise à jour : Décembre 2024 | Version : 0.1.0_
