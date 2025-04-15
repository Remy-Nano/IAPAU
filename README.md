# Application de Comparaison de Modèles d'IA pour Hackathon

Cette application MERN en TypeScript permet aux étudiants d'interagir avec différents modèles d'IA (OpenAI et Mistral), de comparer leurs réponses, et de sélectionner manuellement la meilleure réponse comme version finale.

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, ShadCN/UI, React Hook Form, React Router
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Modèles d'IA**: OpenAI (GPT-3.5 Turbo) et Mistral (mistral-small)
- **Base de données**: MongoDB Atlas

## Fonctionnalités

- Interface de chat pour interagir avec les modèles d'IA
- Sélection du modèle d'IA (OpenAI ou Mistral)
- Sélection du type de prompt (one shot ou contextuel)
- Stockage des conversations dans MongoDB
- Sélection manuelle de la meilleure réponse comme version finale
- Système d'authentification avec différents rôles (étudiant, examinateur, administrateur)
- Tableau de bord spécifique pour chaque rôle utilisateur
- Statistiques sur l'utilisation des tokens et estimation des coûts

## Rôles Utilisateurs

- **Étudiant**: Peut créer des conversations, interagir avec les modèles d'IA et soumettre des versions finales
- **Examinateur**: Peut consulter et analyser les conversations des étudiants
- **Administrateur**: Peut gérer les utilisateurs (étudiants et examinateurs)

## Architecture

- **Frontend**: Application React avec routage et gestion de l'état via contextes
- **Backend**: API RESTful Express avec contrôleurs pour les conversations et l'IA
- **Modèles de données**: Schémas Mongoose pour les utilisateurs et les conversations

## Installation

### Prérequis

- Node.js et npm
- MongoDB Atlas (ou MongoDB local)
- Clés API pour OpenAI et Mistral

### Étapes d'installation

1. Cloner le dépôt

```
git clone <url-du-depot>
cd <nom-du-dossier>
```

2. Installer les dépendances du backend

```
cd backend
npm install
```

3. Installer les dépendances du frontend

```
cd ../frontend
npm install
```

4. Configurer les variables d'environnement
   Créer un fichier `.env` dans le dossier `backend` avec les informations suivantes:

```
MONGODB_URI=<votre-uri-mongodb>
OPENAI_API_KEY=<votre-cle-api-openai>
MISTRAL_API_KEY=<votre-cle-api-mistral>
```

## Démarrage

1. Démarrer le backend

```
cd backend
npm run dev
```

2. Démarrer le frontend (dans un autre terminal)

```
cd frontend
npm run dev
```

3. Accéder à l'application
   Ouvrir http://localhost:5173 dans votre navigateur

## Utilisation

1. Connectez-vous à l'application (ou utilisez une route de test : `/test-login/student`, `/test-login/examiner`, ou `/test-login/admin`)
2. Dans l'interface de chat (pour les étudiants):
   - Sélectionnez un modèle d'IA (OpenAI ou Mistral)
   - Sélectionnez un type de prompt (one shot ou contextuel)
   - Écrivez votre prompt et envoyez-le
   - Comparez les réponses des différents modèles
   - Sélectionnez la meilleure réponse en cochant la case "Version finale"
   - Cliquez sur "Soumettre la version finale" pour enregistrer votre choix
