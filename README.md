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
3. [Bonnes pratiques appliquées](#-bonnes-pratiques-appliquées)
4. [Guide de contribution](#-guide-de-contribution)
5. [Évolutions futures](#-évolutions-futures)
6. [Démarrage rapide](#-démarrage-rapide)
7. [Scripts utilitaires](#-scripts-utilitaires)

---

## 🎯 **Vue d'ensemble**

**Prompt Challenge** est une solution complète d'évaluation et de notation pour hackathons utilisant l'intelligence artificielle. La plateforme permet aux jurys d'évaluer les conversations entre étudiants et différents modèles d'IA (OpenAI, Mistral, Claude, etc.) de manière structurée et transparente.

### **Fonctionnalités principales**

- 🤖 **Multi-IA** : Intégration avec OpenAI, Mistral, et extensible à d'autres fournisseurs
- 👥 **Gestion des rôles** : Étudiants, jurys, administrateurs
- 📊 **Évaluation structurée** : Grille de notation standardisée avec commentaires
- 🔐 **Sécurité avancée** : Authentification sécurisée, hachage bcrypt, validation Zod
- 🌐 **Interface moderne** : UI responsive avec ShadCN/ui et Tailwind CSS

### **Stack technique**

- **Frontend** : Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Mongoose, MongoDB Atlas
- **UI** : ShadCN/ui, Radix UI, Lucide React
- **Validation** : Zod, React Hook Form
- **Auth** : JWT, bcryptjs, Magic Links
- **IA** : OpenAI API, Mistral API (extensible)

---

## 🏗️ **Architecture du projet**

### **Structure des dossiers**

```
prompt-challenge/
├── 📁 src/
│   ├── 📁 app/                    # Pages & API Routes (Next.js 14+)
│   │   ├── 📁 api/               # Routes API backend
│   │   │   ├── auth/             # Authentification
│   │   │   ├── users/            # Gestion utilisateurs
│   │   │   ├── conversations/    # Gestion conversations
│   │   │   ├── evaluations/      # Système d'évaluation
│   │   │   └── hackathons/       # Gestion hackathons
│   │   ├── 📁 admin/             # Interface administration
│   │   ├── 📁 dashboard/         # Tableaux de bord
│   │   └── 📁 login/             # Pages authentification
│   ├── 📁 components/            # Composants React organisés par domaine
│   │   ├── 📁 ui/               # Composants ShadCN/ui réutilisables
│   │   ├── 📁 auth/             # Composants authentification
│   │   ├── 📁 admin/            # Composants administration
│   │   ├── 📁 chat/             # Interface conversation IA
│   │   ├── 📁 student/          # Interface étudiants
│   │   └── 📁 examiner/         # Interface jurys
│   ├── 📁 lib/                   # Logique backend et services
│   │   ├── 📁 models/           # Modèles Mongoose
│   │   ├── 📁 services/         # Logique métier centralisée
│   │   ├── 📁 controllers/      # Contrôleurs HTTP
│   │   ├── 📁 utils/            # Utilitaires partagés
│   │   └── mongoose.ts          # Configuration base de données
│   ├── 📁 types/                # Types TypeScript partagés
│   └── 📁 context/              # Contextes React globaux
├── 📁 scripts/                   # Scripts de maintenance et audit
├── 📁 public/                    # Assets statiques
└── 📄 Configuration files        # Next.js, TypeScript, ESLint, etc.
```

### **Séparation des responsabilités**

#### **Frontend (`/src/app/` + `/src/components/`)**

- **Pages** : Routage et layout dans `/src/app/`
- **Composants UI** : Interface utilisateur pure dans `/src/components/ui/`
- **Composants métier** : Logique business dans `/src/components/{domain}/`

#### **Backend (`/src/lib/`)**

- **Models** : Schémas Mongoose et validation données
- **Services** : Logique métier centralisée et réutilisable
- **Controllers** : Gestion des requêtes HTTP et réponses
- **Utils** : Fonctions utilitaires transversales

#### **Types (`/src/types/`)**

- Types TypeScript partagés entre frontend et backend
- Interfaces de validation et de données métier

---

## ✨ **Bonnes pratiques appliquées**

### **1. Domain-Driven Design (DDD)**

Chaque domaine métier a sa propre organisation :

```typescript
// Exemple : Domaine "Users"
/src/components/admin/users/     # UI spécifique aux utilisateurs
/src/lib/services/userService.ts # Logique métier utilisateurs
/src/lib/models/user.ts          # Modèle de données utilisateur
/src/types/userValidation.ts     # Types et validations
```

### **2. Séparation stricte des préoccupations**

```typescript
// ✅ Route API minimaliste
export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();

  try {
    const user = await createUser(data); // ← Logique dans le service
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ✅ Service avec logique métier
export async function createUser(data: CreateUserData) {
  // Validation, hachage, création en base...
  const passwordHash = await bcrypt.hash(data.password, 10);
  return await User.create({ ...data, passwordHash });
}
```

### **3. Type Safety & Validation**

- **Zod** pour la validation des données d'entrée
- **TypeScript strict** pour la cohérence du code
- **Interfaces partagées** entre frontend et backend

```typescript
// Types centralisés
export interface CreateUserData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  role?: UserRole;
}
```

### **4. Gestion des erreurs robuste**

```typescript
// Gestion d'erreurs structurée avec codes HTTP appropriés
if (error.code === 11000) {
  return NextResponse.json(
    { error: "Une évaluation existe déjà pour cette combinaison" },
    { status: 409 }
  );
}
```

### **5. ShadCN/ui : Extensibilité Future-Proof**

Les composants ShadCN/ui non utilisés sont **intentionnellement conservés** :

- **Extensibilité** : Ajout rapide de nouvelles fonctionnalités
- **Cohérence** : Design system uniforme
- **Maintenance** : Pas de réinstallation/reconfiguration

### **6. Scripts de maintenance intégrés**

- `scripts/find-unused-components.js` : Audit des composants orphelins
- `scripts/analyze-api-architecture.js` : Évaluation de la qualité de l'architecture API

---

## 🛠️ **Guide de contribution**

### **Standards de code**

- **Naming** : camelCase pour les variables, PascalCase pour les composants
- **Exports** : Named exports préférés aux default exports
- **Imports** : Utilisez les alias `@/` pour les imports absolus
- **Types** : Toujours typer les paramètres et retours de fonction

```typescript
// ✅ Bon exemple
export async function createEvaluation(
  data: CreateEvaluationData
): Promise<IEvaluation> {
  // Implementation...
}

// ❌ À éviter
export default function createEvaluation(data: any): any {
  // Implementation...
}
```

---

## 🚀 **Évolutions futures**

### **1. Intégration de nouveaux modèles d'IA**

#### **Guide step-by-step**

1. **Créer le service IA** :

   ```typescript
   // /src/lib/services/anthropicService.ts
   export class AnthropicService implements IAIService {
     async generateResponse(prompt: string): Promise<string> {
       // Implémentation Claude API
     }
   }
   ```

2. **Ajouter la configuration** :

   ```typescript
   // /src/lib/config.ts
   export const AI_PROVIDERS = {
     openai: { name: "OpenAI GPT-4", apiKey: process.env.OPENAI_API_KEY },
     mistral: { name: "Mistral 7B", apiKey: process.env.MISTRAL_API_KEY },
     claude: { name: "Claude 3", apiKey: process.env.ANTHROPIC_API_KEY }, // ← Nouveau
   };
   ```

3. **Étendre le sélecteur frontend** :

   ```tsx
   // Modifier le composant ModelSelect
   const availableModels = [
     { id: "openai", name: "OpenAI GPT-4" },
     { id: "mistral", name: "Mistral 7B" },
     { id: "claude", name: "Claude 3" }, // ← Nouveau
   ];
   ```

4. **Variables d'environnement** :
   ```bash
   # .env.local
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

#### **Sécurité des clés API**

- **Développement** : `.env.local` (gitignore)
- **Client** : Jamais exposer les clés côté frontend

### **2. Gestion dynamique des groupes**

#### **Refonte du système de groupes**

**Discuter avec le maître d'œuvre** :

- Définir la structure des groupes
- Règles d'affectation automatique vs manuelle
- Permissions par groupe

### **3. Roadmap technique**

#### **Court terme**

- [ ] Intégration Claude et Deepseek
- [ ] Tests unitaires complets (Jest + React Testing Library)
- [ ] Monitoring et logs avancés
- [ ] Cache Redis pour les performances

---

## 🏃‍♂️ **Démarrage rapide**

### **Prérequis**

- Node.js 18+
- MongoDB Atlas (ou instance locale)
- Clés API IA (OpenAI, Mistral)

### **Installation**

```bash
# 1. Cloner le repository
git clone https://github.com/your-org/prompt-challenge.git
cd prompt-challenge

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# 4. Lancer en développement
npm run dev
```

### **Variables d'environnement**

```bash
# .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
MISTRAL_API_KEY=your-mistral-key
JWT_SECRET=your-jwt-secret
```

### **Premier démarrage**

1. 🌐 Ouvrir http://localhost:3000
2. 👤 Créer un compte administrateur
3. 🗂️ Configurer un hackathon
4. 👥 Importer des utilisateurs (CSV)
5. 🚀 Tester une conversation IA

---

## 🔧 **Scripts utilitaires**

# Build et vérification

npm run build
npm run lint

````

### **Scripts personnalisés**

```bash
# Développement avec hot reload
npm run dev

# Build de production
npm run build && npm start

# Linting et formatage
npm run lint
````
