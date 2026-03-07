# Changelog - Prompt Challenge

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Non publié]

### Documentation

- Alignement de `docs/api-docs.md` avec les routes d'authentification actuelles (`/api/auth/login`, `/api/auth/credentials`, `/api/auth/magic-link/verify`)
- Correction du format CSV documenté pour `/api/users/import` (suppression de la colonne `password` non utilisée)
- Harmonisation des exemples de comptes dans `README.md`, `docs/guide-admin.md`, `docs/guide-examinateur.md` et `docs/securite.md`
- Ajout de la documentation CD OVH (`docs/deploiement-ovh-manuel.md`) avec workflow GitHub Actions et verification health-check
- Correction des commandes de maintenance securitaire (`docs/securite.md`) pour coller aux scripts existants
- Nettoyage des references UML (`docs/diagrammes-uml.md`) avec suppression d'un fichier non present

### À venir

- Système de notifications temps réel
- Export avancé des données (PDF, Excel)
- Tableau de bord analytique pour admins
- API WebSocket pour chat en temps réel
- Support multi-langues (EN/FR)
- Authentification OAuth2 (Google, Microsoft)

---

## [0.1.0] - 2024-12-25

### ✨ Ajouté

#### 🎯 Fonctionnalités principales

- **Plateforme IA éducative complète** pour hackathons d'étudiants
- **Interface de chat intelligente** avec modèles OpenAI et Mistral
- **Système d'évaluation** par jury d'experts
- **Gestion des hackathons** avec quotas et paramètres personnalisables
- **Tableau de bord multi-rôles** (Étudiant, Examinateur, Admin)

#### 🔐 Authentification et sécurité

- **Authentification différenciée par rôle** :
  - Étudiants : Liens magiques via email (sans mot de passe)
  - Examinateurs/Admins : Email/mot de passe sécurisé
- **Protection JWT** avec expiration courte (10 minutes)
- **Middleware de sécurité** automatique pour toutes les API
- **Hashage bcrypt** des mots de passe avec salt
- **Validation double** côté client et serveur (Zod)
- **Protection contre les attaques** : XSS, injection NoSQL, CSRF

#### 👥 Gestion des utilisateurs

- **CRUD complet des utilisateurs** par les administrateurs
- **Import CSV en masse** avec validation et aperçu
- **Profils utilisateurs étendus** :
  - Étudiants : Formation, niveau, numéro étudiant
  - Jury : Diplôme, expérience, secteur d'activité
- **Système de rôles granulaire** avec permissions spécifiques
- **Validation temps réel** des formulaires avec messages d'erreur

#### 🏆 Système de hackathons

- **Configuration complète** :
  - Dates de début et fin
  - Quotas par étudiant (prompts et tokens)
  - Tâches personnalisées
  - Mode anonyme optionnel
- **Statuts multiples** : Brouillon, En cours, Test, Terminé
- **Validation automatique** des contraintes temporelles
- **Interface responsive** pour mobile et desktop

#### 💬 Interface de conversation IA

- **Chat temps réel** avec historique persistant
- **Sélection de modèles IA** :
  - OpenAI : GPT-3.5-turbo, GPT-4, GPT-4-turbo
  - Mistral : mistral-tiny, mistral-small, mistral-medium
- **Paramètres avancés** :
  - Temperature (0.1-2.0) avec slider visuel
  - Max tokens (50-4000) avec compteur temps réel
- **Types de prompt** : One-shot vs Contextuel
- **Sidebar des conversations** avec filtrage et recherche
- **Compteur de tokens/prompts** utilisés vs autorisés
- **Soumission de version finale** avec validation

#### 📊 Système d'évaluation

- **Interface d'évaluation intuitive** avec :
  - Slider de notation (1-10) avec couleurs visuelles
  - Commentaires obligatoires avec aide contextuelle
  - Mode révision des évaluations passées
- **Filtrage intelligent** par hackathon et tâche
- **Contrainte d'unicité** : une évaluation par conversation/examinateur
- **Statistiques temps réel** avec barres de progression
- **Validation côté serveur** avec gestion des conflits

#### 🎨 Interface utilisateur

- **Design moderne** avec Tailwind CSS et Radix UI
- **Composants réutilisables** : Buttons, Cards, Modals, Tooltips
- **Theme cohérent** avec palette de couleurs professionnelle
- **Responsive design** adaptatif mobile/tablet/desktop
- **Animations fluides** et micro-interactions
- **Accessibilité** : Support clavier, ARIA labels, contraste

#### 🛠️ Infrastructure technique

- **Next.js 15** avec App Router et Server Components
- **TypeScript** pour la sécurité de type complète
- **MongoDB** avec Mongoose pour la persistance
- **API REST** complète avec documentation
- **Validation Zod** unifiée client/serveur
- **Nodemailer (SMTP)** pour l'envoi d'emails sécurisé
- **Environnement configurable** avec variables d'environnement

### 🔧 Améliorations techniques

#### 📡 API et backend

- **Structure modulaire** avec contrôleurs, services et modèles
- **Gestion d'erreurs centralisée** avec codes HTTP appropriés
- **Logging sécurisé** sans exposition de données sensibles
- **Health check endpoint** pour monitoring
- **Rate limiting conceptuel** contre les attaques bruteforce
- **CORS configuré** pour sécurité inter-domaines

#### 🗄️ Base de données

- **Schémas Mongoose rigoureux** avec validation
- **Index optimisés** pour performance
- **Contraintes d'unicité** (email, évaluations)
- **Relations référentielles** entre collections
- **Migrations sécurisées** et rollback possible
- **Sanitization automatique** des entrées

#### ⚡ Performance

- **Lazy loading** des composants React
- **Optimisation des requêtes** MongoDB avec lean()
- **Mise en cache côté client** avec SWR
- **Compression automatique** des assets
- **Tree shaking** pour réduire la taille du bundle
- **Server-side rendering** pour SEO

### 🔄 Intégrations

#### 🤖 Services IA

- **OpenAI API** intégration complète :
  - Support multi-modèles
  - Gestion des erreurs et retry automatique
  - Comptage précis des tokens
  - Configuration par hackathon
- **Mistral AI** support expérimental :
  - API unifiée avec OpenAI
  - Modèles optimisés pour le français
  - Paramètres équivalents

#### 📧 Service email

- **SMTP (Nodemailer) intégration** pour liens magiques :
  - Templates HTML responsifs
  - Protection anti-tracking
  - Gestion des erreurs d'envoi
  - Logs détaillés pour debugging
  - Configuration SMTP sécurisée

### 📚 Documentation

#### 📖 Guides utilisateurs

- **Guide étudiant complet** (572 lignes) :

  - Processus de connexion par lien magique
  - Utilisation de l'interface de chat
  - Paramètres IA et bonnes pratiques
  - Processus de soumission finale
  - FAQ détaillée avec solutions

- **Guide administrateur** (550+ lignes) :

  - Gestion des utilisateurs et import CSV
  - Configuration des hackathons
  - Interface d'administration
  - Bonnes pratiques sécuritaires
  - Procédures de maintenance

- **Guide examinateur** (550+ lignes) :
  - Processus d'évaluation
  - Interface de notation
  - Filtrage et organisation
  - Bonnes pratiques d'évaluation
  - Critères de notation détaillés

#### 🔒 Documentation sécurité

- **Documentation sécurité complète** (1500+ lignes) :
  - Architecture sécuritaire multi-couches
  - Authentification et autorisation RBAC
  - Protection contre les attaques courantes
  - Conformité RGPD et audit
  - Procédures d'incident et formation

#### 🔌 Documentation API

- **Documentation API REST** (1000+ lignes) :
  - Tous les endpoints documentés
  - Modèles de données TypeScript
  - Exemples d'utilisation par rôle
  - Codes d'erreur et gestion
  - Workflows complets

### 🐛 Corrections de bugs

#### 🔧 Authentification

- **Correction boucles infinies** dans ProtectedRoute avec timeout
- **Gestion erreurs JWT** avec messages clairs
- **Validation format email** stricte côté client et serveur
- **Nettoyage automatique** des tokens expirés
- **Protection contre timing attacks** sur les credentials

#### 💾 Persistance des données

- **Gestion conflits MongoDB** avec contraintes uniques
- **Validation croisée** des références entre collections
- **Nettoyage des données orphelines** lors des suppressions
- **Transactions atomiques** pour opérations critiques
- **Backup automatique** avant modifications importantes

#### 🎨 Interface utilisateur

- **Correction responsive** sur tous les breakpoints
- **Gestion états de chargement** pour toutes les actions
- **Validation formulaires** en temps réel sans lag
- **Accessibilité clavier** complète
- **Messages d'erreur** contextuels et actionnables

#### 📱 Compatibilité

- **Support Safari** complet avec polyfills
- **Optimisation mobile** pour iOS et Android
- **Fallbacks gracieux** pour anciennes versions
- **Progressive enhancement** pour fonctionnalités avancées
- **SSR/CSR hybride** sans hydratation mismatch

### ⚠️ Deprecated

#### 🔄 Anciennes APIs

- **Endpoints auth legacy** remplacés par système unifié
- **Format d'import CSV ancien** (support maintenu jusqu'à v0.2.0)
- **Composants UI custom** remplacés par Radix UI
- **Système de routing React Router** migré vers Next.js App Router

### 🗑️ Supprimé

#### 🧹 Nettoyage technique

- **Dépendances inutilisées** : React Router DOM devrait être supprimé
- **Composants legacy** non utilisés
- **Variables d'environnement** obsolètes
- **Migrations MongoDB** anciennes versions
- **Assets statiques** non référencés

### 🔐 Sécurité

#### 🛡️ Vulnérabilités corrigées

- **Injection NoSQL** : Protection automatique Mongoose
- **XSS** : Échappement automatique React + CSP headers
- **CSRF** : Protection Next.js Server Actions
- **Session hijacking** : JWT courte durée + rotation
- **Privilege escalation** : Validation stricte des rôles

#### 🔒 Améliorations sécuritaires

- **Headers sécurité** : HSTS, X-Frame-Options, CSP
- **Validation input** : Sanitization automatique
- **Audit logging** : Traçabilité complète des actions
- **Rate limiting** : Protection contre bruteforce
- **Secrets management** : Variables d'environnement obligatoires

---

## 📋 Notes de version

### 🎯 Roadmap v0.2.0 (Q1 2025)

- [ ] **Notifications temps réel** : WebSocket + Push notifications
- [ ] **Analytics avancées** : Tableau de bord avec graphiques
- [ ] **Export de données** : PDF, Excel, API bulk
- [ ] **Amélioration UX** : Drag & drop, shortcuts clavier
- [ ] **Performance** : Pagination, lazy loading avancé

### 🎯 Roadmap v0.3.0 (Q2 2025)

- [ ] **Multi-tenant** : Support de plusieurs organisations
- [ ] **Collaboration** : Hackathons en équipe
- [ ] **API publique** : SDK et webhooks
- [ ] **Mobile app** : React Native ou PWA
- [ ] **IA avancée** : Fine-tuning modèles personnalisés

### 🛠️ Prérequis techniques

#### 📦 Dépendances principales

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0
- **npm** >= 8.0.0

#### 🔧 Variables d'environnement requises

```bash
JWT_SECRET=your-secret-key-32-chars-minimum
MONGODB_URI=mongodb://localhost:27017/prompt-challenge
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@domaine.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM="STUDIA <votre-email@domaine.com>"
OPENAI_API_KEY=sk-your-openai-key
MISTRAL_API_KEY=your-mistral-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

#### 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/prompt-challenge.git
cd prompt-challenge

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Démarrer le serveur de développement
npm run dev
```

### 🤝 Contribution

#### 🔄 Workflow de développement

1. **Fork** du repository principal
2. **Création branche** feature/fix depuis `main`
3. **Développement** avec tests unitaires
4. **Pull Request** avec description détaillée
5. **Review** par l'équipe core
6. **Merge** après validation

#### 📝 Standards de code

- **ESLint** configuration stricte
- **Prettier** formatage automatique
- **TypeScript** mode strict
- **Conventional Commits** pour les messages
- **Tests** obligatoires pour nouvelles fonctionnalités

#### 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### 📞 Support

#### 🆘 Channels de support

- **GitHub Issues** : Bugs et demandes de fonctionnalités
- **Discussions** : Questions générales et aide
- **Email** : support@prompt-challenge.com
- **Documentation** : [docs.prompt-challenge.com](https://docs.prompt-challenge.com)

#### 🐛 Signalement de bugs

1. **Vérifier** si le bug n'existe pas déjà
2. **Reproduire** le bug avec étapes détaillées
3. **Collecter** logs et informations système
4. **Créer issue** avec template fourni
5. **Suivre** les mises à jour et tests

---

## 📊 Métriques du projet

### 📈 Statistiques de développement

- **Lignes de code** : ~15,000 (TypeScript/JavaScript)
- **Composants React** : 45+
- **API Endpoints** : 25+
- **Tests** : 150+ (en développement)
- **Documentation** : 3,500+ lignes

### 🏗️ Architecture

- **Frontend** : Next.js 15 + React 19 + TypeScript
- **Backend** : Next.js API Routes + MongoDB
- **Styling** : Tailwind CSS + Radix UI
- **State Management** : React Context + SWR
- **Authentication** : JWT + Magic Links
- **Database** : MongoDB + Mongoose ODM

### 📦 Bundle size

- **Client bundle** : ~250KB gzipped
- **Server bundle** : ~8MB
- **Dependencies** : 35 runtime, 15 dev
- **Performance** : Lighthouse 95+ score

> 📝 **Note** : Ce changelog suit les conventions [Keep a Changelog](https://keepachangelog.com/) et [Semantic Versioning](https://semver.org/). Les versions suivent le format MAJOR.MINOR.PATCH où :
>
> - **MAJOR** : Changements incompatibles de l'API
> - **MINOR** : Nouvelles fonctionnalités compatibles
> - **PATCH** : Corrections de bugs compatibles
