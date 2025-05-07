# Prompt Challenge - Interface de Chat IA

Une plateforme moderne de chat avec IA permettant aux étudiants d'interagir avec différents modèles d'intelligence artificielle, de sauvegarder leurs conversations et de soumettre des versions finales.

## 🌟 Fonctionnalités

- **Multi-modèles d'IA** : Support pour OpenAI (GPT) et Mistral AI
- **Historique de conversations** : Interface intuitive avec historique des échanges
- **Version finale** : Sélection et sauvegarde d'une version finale des conversations
- **Authentification** : Système de connexion sécurisé
- **Interface responsive** : Compatible desktop et mobile
- **Expérience utilisateur fluide** : Réponses en temps réel sans rechargement de page

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
│   │   ├── dashboard/         # Interface principale
│   │   ├── login/             # Authentification
│   │   └── version-finale/    # Affichage des versions finales
│   ├── components/            # Composants React
│   │   ├── chat/              # Composants de l'interface de chat
│   │   ├── ui/                # Composants UI réutilisables
│   │   └── ...
│   ├── context/               # Contextes React (Auth, etc.)
│   ├── lib/                   # Utilitaires et services
│   │   ├── api/               # Clients API
│   │   ├── models/            # Modèles de données MongoDB
│   │   └── controllers/       # Contrôleurs API
│   └── types/                 # Définitions TypeScript
├── public/                    # Fichiers statiques
├── package.json               # Dépendances et scripts
└── next.config.ts             # Configuration Next.js
```

## 🌈 Évolutions récentes

- **Interface Utilisateur Améliorée** : Design moderne avec effets de transition et feedback visuel
- **Titres de conversations automatiques** : Format "Conversation JJ/MM/AAAA HH:MM:SS"
- **Affichage en temps réel** : Les réponses s'affichent instantanément sans rechargement
- **Indicateur de chargement** : Animation visuelle durant la génération des réponses
- **Défilement automatique** : Scroll automatique vers les nouvelles réponses
- **Thème modernisé** : Dégradés, ombres et effets visuels pour une meilleure expérience

## 🔄 Utilisation

1. Connectez-vous à votre compte
2. Accédez au tableau de bord
3. Créez une nouvelle conversation ou poursuivez une existante
4. Sélectionnez le modèle d'IA souhaité (OpenAI ou Mistral)
5. Envoyez votre prompt et recevez une réponse en temps réel
6. Sélectionnez une version finale pour la soumettre définitivement

## 🛠️ Technologies utilisées

- [Next.js 15](https://nextjs.org/) - Framework React
- [React 19](https://reactjs.org/) - Bibliothèque UI
- [MongoDB](https://www.mongodb.com/) - Base de données
- [Tailwind CSS 4](https://tailwindcss.com/) - Framework CSS
- [OpenAI API](https://openai.com/api/) - API pour GPT
- [Mistral AI](https://mistral.ai/) - Modèle d'IA alternatif

## 📝 Notes de développement

- L'application utilise Turbopack pour un développement plus rapide (`npm run dev`)
- Les réponses de l'IA sont maintenant affichées instantanément sans rechargement
- Le système d'authentification utilise JWT pour la sécurité
- Les conversations sont stockées dans MongoDB pour une persistance des données

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
