# Prompt Challenge - Interface de Chat IA

Une plateforme moderne de chat avec IA permettant aux étudiants d'interagir avec différents modèles d'intelligence artificielle, de sauvegarder leurs conversations et de soumettre des versions finales.

## 🌟 Fonctionnalités

- **Multi-modèles d'IA** : Support pour OpenAI (GPT) et Mistral AI
- **Historique de conversations** : Interface intuitive avec historique des échanges
- **Version finale** : Sélection et sauvegarde d'une version finale des conversations
- **Authentification** : Système de connexion sécurisé avec magic link
- **Interface responsive** : Compatible desktop et mobile
- **Expérience utilisateur fluide** : Réponses en temps réel sans rechargement de page
- **Personnalisation avancée** : Contrôle de température et nombre maximum de tokens
- **Statistiques de conversation** : Analyse des interactions et métriques d'utilisation

## 🔧 Prérequis

- Node.js 20.x ou supérieur
- MongoDB (local ou Atlas)
- Clés API pour les modèles d'IA (OpenAI, Mistral)
- XAMPP (si besoin d'un environnement local pour MongoDB)

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

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# MongoDB
MONGODB_URI=votre_uri_mongodb

# JWT
JWT_SECRET=votre_clé_secrète

# OpenAI
OPENAI_API_KEY=votre_clé_api_openai

# Mistral AI
MISTRAL_API_KEY=votre_clé_api_mistral

# Configuration app
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. **Démarrer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## 📁 Structure du projet

```
prompt-challenge/
├── src/                       # Code source
│   ├── app/                   # Pages et routes (Next.js App Router)
│   │   ├── api/               # Routes API
│   │   │   ├── auth/          # API d'authentification
│   │   │   ├── conversations/ # API de gestion des conversations
│   │   │   ├── login/         # API de connexion
│   │   │   ├── users/         # API de gestion des utilisateurs
│   │   │   └── health/        # API de vérification de santé
│   │   ├── dashboard/         # Interface principale
│   │   ├── login/             # Authentification
│   │   ├── magic-link/        # Connexion par lien magique
│   │   ├── unauthorized/      # Page d'accès non autorisé
│   │   └── version-finale/    # Affichage des versions finales
│   ├── components/            # Composants React
│   │   ├── auth/              # Composants d'authentification
│   │   ├── chat/              # Composants de l'interface de chat
│   │   │   ├── ChatInterface.tsx        # Interface principale de chat
│   │   │   ├── ConversationSidebar.tsx  # Barre latérale des conversations
│   │   │   ├── ResponseList.tsx         # Liste des réponses
│   │   │   ├── PromptInput.tsx          # Saisie de prompt
│   │   │   ├── ModelSelect.tsx          # Sélection du modèle d'IA
│   │   │   ├── TemperatureSlider.tsx    # Contrôle de température
│   │   │   ├── MaxTokensSlider.tsx      # Limitation de tokens
│   │   │   ├── TokenCounter.tsx         # Compteur de tokens
│   │   │   ├── ConversationStats.tsx    # Statistiques de conversation
│   │   │   └── SubmitFinalButton.tsx    # Soumission version finale
│   │   └── ui/                # Composants UI réutilisables
│   ├── context/               # Contextes React (Auth, etc.)
│   ├── lib/                   # Utilitaires et services
│   │   ├── models/            # Modèles de données MongoDB
│   │   │   ├── user.ts        # Modèle utilisateur
│   │   │   └── conversation.ts # Modèle de conversation
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

### Fonctionnalités en cours de développement

- 🔄 **Optimisation des performances** : Amélioration du chargement des conversations
- 🔄 **Exportation de conversations** : Format PDF et partage de liens
- 🔄 **Interface d'administration** : Tableau de bord pour les administrateurs
- 🔄 **Analyse des prompts** : Système de suggestion pour améliorer les prompts
- 🔄 **Mode hors-ligne** : Fonctionnement en cas de perte de connexion

### Améliorations techniques récentes

- **Utilisation de React 19** : Mise à niveau vers la dernière version avec améliorations de performance
- **TailwindCSS 4** : Mise à jour vers la dernière version du framework CSS
- **Turbopack** : Activation du bundler pour des performances de développement améliorées
- **TypeScript stricte** : Types rigoureux pour une meilleure qualité de code
- **Optimisation MongoDB** : Schémas et indexes optimisés pour les performances

## 🔄 Utilisation

1. Connectez-vous à votre compte (par email ou magic link)
2. Accédez au tableau de bord
3. Créez une nouvelle conversation ou poursuivez une existante
4. Sélectionnez le modèle d'IA souhaité (OpenAI ou Mistral)
5. Ajustez les paramètres (température, tokens maximum) selon vos besoins
6. Envoyez votre prompt et recevez une réponse en temps réel
7. Consultez les statistiques de votre conversation
8. Sélectionnez une version finale pour la soumettre définitivement

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

## 📝 Notes de développement

- Utilisation de `npm run dev --turbopack` pour un développement rapide
- Structure modulaire avec composants spécialisés pour le chat
- Interface réactive avec comptage de tokens en temps réel
- Système de sliders pour ajuster les paramètres IA facilement
- Modèles de données MongoDB optimisés pour les requêtes fréquentes

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
