# Prompt Challenge - Interface de Chat IA

Une plateforme moderne de chat avec IA permettant aux étudiants d'interagir avec différents modèles d'intelligence artificielle, de sauvegarder leurs conversations et de soumettre des versions finales. Inclut également une gestion des utilisateurs, des imports CSV et des hackathons.

## 🌟 Fonctionnalités

- **Multi-modèles d'IA** : Support pour OpenAI (GPT) et Mistral AI
- **Historique de conversations** : Interface intuitive avec historique des échanges
- **Version finale** : Sélection et sauvegarde d'une version finale des conversations
- **Authentification** : Système de connexion sécurisé avec magic link
- **Interface responsive** : Compatible desktop et mobile
- **Expérience utilisateur fluide** : Réponses en temps réel sans rechargement de page
- **Personnalisation avancée** : Contrôle de température et nombre maximum de tokens
- **Statistiques de conversation** : Analyse des interactions et métriques d'utilisation
- **Gestion des utilisateurs** : Interface d'administration pour créer, modifier et supprimer des utilisateurs
- **Import CSV** : Importation en masse d'utilisateurs via fichiers CSV
- **Gestion des hackathons** : Organisation et suivi des événements de hackathon

## 🔧 Prérequis

- Node.js 20.x ou supérieur
- MongoDB (local ou Atlas)
- Clés API pour les modèles d'IA (OpenAI, Mistral)
- XAMPP pour l'environnement local (optionnel, si vous préférez MongoDB local)

## 🚀 Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/prompt-challenge.git
cd prompt-challenge
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer MongoDB**

Deux options s'offrent à vous :

**Option 1 : MongoDB Atlas (Cloud)**

- Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Créez un nouveau cluster (la version gratuite est suffisante)
- Configurez l'accès réseau pour autoriser votre IP
- Créez un utilisateur de base de données
- Obtenez votre URI de connexion (à utiliser dans les variables d'environnement)

**Option 2 : MongoDB Local (avec XAMPP)**

- Installez [XAMPP](https://www.apachefriends.org/index.html)
- Démarrez les services Apache et MongoDB
- La base de données sera accessible sur `mongodb://localhost:27017`

4. **Obtenir les clés API pour les modèles d'IA**

- Pour OpenAI (GPT) :

  - Créez un compte sur [OpenAI](https://platform.openai.com/)
  - Générez une clé API dans la section "API Keys"

- Pour Mistral AI :
  - Créez un compte sur [Mistral AI](https://console.mistral.ai/)
  - Générez une clé API dans votre espace développeur

5. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# MongoDB
MONGODB_URI=votre_uri_mongodb

# JWT
JWT_SECRET=votre_clé_secrète_pour_jwt

# OpenAI
OPENAI_API_KEY=votre_clé_api_openai

# Mistral AI
MISTRAL_API_KEY=votre_clé_api_mistral

# Configuration app
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Email (pour magic link)
EMAIL_SERVER=smtp://utilisateur:mot_de_passe@votreserveur:port
EMAIL_FROM=email@exemple.com
```

6. **Initialiser la base de données (optionnel)**

Pour créer un utilisateur administrateur initial :

```bash
# Cette commande initialisera la base de données avec un administrateur
node scripts/init-db.js
```

7. **Démarrer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

8. **Création du build de production (optionnel)**

```bash
npm run build
npm start
```

## 📁 Structure du projet

```
prompt-challenge/
├── src/                       # Code source
│   ├── app/                   # Pages et routes (Next.js App Router)
│   │   ├── api/               # Routes API
│   │   │   ├── auth/          # API d'authentification
│   │   │   ├── conversations/ # API de gestion des conversations
│   │   │   ├── users/         # API de gestion des utilisateurs
│   │   │   ├── hackathons/    # API de gestion des hackathons
│   │   │   └── health/        # API de vérification de santé
│   │   ├── admin/             # Interface d'administration
│   │   │   └── users/         # Gestion des utilisateurs (CRUD + import)
│   │   ├── dashboard/         # Interface principale
│   │   ├── login/             # Authentification
│   │   ├── magic-link/        # Connexion par lien magique
│   │   ├── unauthorized/      # Page d'accès non autorisé
│   │   └── version-finale/    # Affichage des versions finales
│   ├── components/            # Composants React
│   │   ├── auth/              # Composants d'authentification
│   │   ├── admin/             # Composants d'administration
│   │   ├── chat/              # Composants de l'interface de chat
│   │   └── ui/                # Composants UI réutilisables
│   ├── context/               # Contextes React (Auth, etc.)
│   ├── lib/                   # Utilitaires et services
│   │   ├── models/            # Modèles de données MongoDB
│   │   │   ├── user.ts        # Modèle utilisateur
│   │   │   ├── conversation.ts # Modèle de conversation
│   │   │   └── hackathon.ts   # Modèle de hackathon
│   └── types/                 # Définitions TypeScript
├── public/                    # Fichiers statiques
├── middleware.ts              # Middleware Next.js (authentification)
├── package.json               # Dépendances et scripts
└── next.config.ts             # Configuration Next.js
```

## 🌈 État d'avancement du projet

### Fonctionnalités implémentées

- ✅ **Architecture complète Next.js 15** : Structure App Router moderne avec API routes
- ✅ **Interface de chat fonctionnelle** : Interactions en temps réel avec les modèles d'IA
- ✅ **Intégration multi-modèles** : Support OpenAI (v4.97.0) et Mistral AI (v1.6.0)
- ✅ **Système d'authentification** : Magic link et JWT pour la sécurité
- ✅ **Gestion des conversations** : Création, lecture, historique et suppression
- ✅ **Middleware d'authentification** : Protection des routes privées
- ✅ **Personnalisation des paramètres d'IA** : Contrôle de température et limite de tokens
- ✅ **Interface utilisateur moderne** : Composants Radix UI et TailwindCSS 4
- ✅ **Stockage de données MongoDB** : Modèles utilisateurs et conversations
- ✅ **Soumission de version finale** : Sauvegarde d'une conversation comme version finale
- ✅ **Gestion des utilisateurs** : Interface admin pour créer/éditer/supprimer des utilisateurs
- ✅ **Import CSV d'utilisateurs** : Import en masse avec validation
- ✅ **Gestion des hackathons** : Création et suivi d'événements de hackathon

## 🔄 Guide d'utilisation

### Interface utilisateur standard

1. Connectez-vous à votre compte (par email ou magic link)
2. Accédez au tableau de bord
3. Créez une nouvelle conversation ou poursuivez une existante
4. Sélectionnez le modèle d'IA souhaité (OpenAI ou Mistral)
5. Ajustez les paramètres (température, tokens maximum) selon vos besoins
6. Envoyez votre prompt et recevez une réponse en temps réel
7. Consultez les statistiques de votre conversation
8. Sélectionnez une version finale pour la soumettre définitivement

### Interface d'administration

1. Connectez-vous avec un compte administrateur
2. Accédez à la section d'administration via le menu
3. Gérez les utilisateurs (création, modification, suppression)
4. Importez des utilisateurs en masse via CSV (modèle disponible)
5. Gérez les hackathons (création, dates, participants)

### Import CSV d'utilisateurs

1. Accédez à la section Admin > Utilisateurs > Import
2. Téléchargez le modèle CSV fourni
3. Remplissez le fichier avec les informations des utilisateurs
4. Importez le fichier dans l'interface
5. Validez les données et confirmez l'import

## 🛠️ Technologies utilisées

- [Next.js 15.3.1](https://nextjs.org/) - Framework React avec App Router
- [React 19](https://reactjs.org/) - Bibliothèque UI dernière version
- [MongoDB](https://www.mongodb.com/) - Base de données NoSQL
- [Mongoose 8.14.1](https://mongoosejs.com/) - ODM pour MongoDB
- [Tailwind CSS 4](https://tailwindcss.com/) - Framework CSS utility-first
- [OpenAI API 4.97.0](https://openai.com/api/) - API pour GPT
- [Mistral AI 1.6.0](https://mistral.ai/) - Modèle d'IA alternatif
- [JWT](https://jwt.io/) - Authentification sécurisée
- [Radix UI](https://www.radix-ui.com/) - Composants UI accessibles
- [Turbopack](https://turbo.build/pack) - Bundler nouvelle génération pour Next.js
- [Zod](https://zod.dev) - Validation de schémas TypeScript
- [React Hook Form](https://react-hook-form.com/) - Gestion de formulaires

## 📝 Résolution de problèmes courants

### Connexion à MongoDB

Si vous rencontrez des problèmes de connexion à MongoDB :

- Vérifiez que l'URI dans votre fichier `.env.local` est correct
- Assurez-vous que l'utilisateur a les droits d'accès nécessaires
- Si vous utilisez MongoDB Atlas, vérifiez que votre IP est autorisée

### Problèmes avec les clés API

Si les modèles d'IA ne répondent pas :

- Vérifiez que vos clés API sont valides et correctement configurées
- Confirmez que vous avez du crédit disponible sur vos comptes d'API
- Assurez-vous que les clés sont correctement formatées dans le fichier `.env.local`

### Démarrage serveur

Si vous rencontrez des erreurs au démarrage du serveur :

- Nettoyez le cache avec `npm run clean` puis réessayez
- Vérifiez que toutes les dépendances sont installées avec `npm install`
- Assurez-vous d'utiliser Node.js 20.x ou supérieur

## 🔜 Prochaines étapes

- Implémentation de tests automatisés avec Jest et React Testing Library
- Intégration de nouveaux modèles d'IA (Claude, Ollama, etc.)
- Système de suggestions de prompts basé sur l'historique
- Mode collaboratif pour partager des sessions de chat
- Amélioration des analytics pour l'utilisateur et l'administrateur

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
