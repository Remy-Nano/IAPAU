# Hackathon - Plateforme d'Évaluation par IA

Une application web permettant aux étudiants d'interagir avec des modèles d'IA, tandis que les examinateurs peuvent évaluer leurs prompts et réponses. Le système comprend également une interface d'administration pour gérer les utilisateurs.

## 🚀 Fonctionnalités

- **Authentification multi-rôles** (étudiant, examinateur, administrateur)
- **Interface étudiant** avec chat IA et système de tokens
- **Interface examinateur** pour évaluer les interactions des étudiants
- **Interface administrateur** pour gérer les utilisateurs
- **Design responsive** avec Tailwind CSS

## 📋 Prérequis

- Node.js (v14+)
- npm ou yarn

## ⚙️ Installation

1. Cloner le dépôt

   ```bash
   git clone <url-du-repo>
   cd Hackathon
   ```

2. Installer les dépendances du frontend et du backend

   ```bash
   # Installation des dépendances frontend
   cd frontend
   npm install

   # Installation des dépendances backend
   cd ../backend
   npm install
   ```

3. Lancer l'application en mode développement (dans deux terminaux séparés)

   ```bash
   # Terminal 1 - Lancer le frontend
   cd frontend
   npm run dev

   # Terminal 2 - Lancer le backend
   cd backend
   npm run server
   ```

## 🔐 Comptes de test

### Administrateur

- **Email**: `admin@example.com`
- **Mot de passe**: `admin123`

### Examinateur

- **Email**: `examiner@example.com`
- **Mot de passe**: `examiner123`

### Étudiant

- **Email**: `student@example.com`
- **Méthode**: Lien magique (connexion automatique en mode démonstration)

## 🔄 Flux d'utilisation

### Étudiants

1. Se connecter avec email (un lien magique est envoyé)
2. Accéder au dashboard étudiant
3. Sélectionner un modèle d'IA
4. Échanger avec l'IA (chaque échange consomme des tokens)

### Examinateurs

1. Se connecter avec email et mot de passe
2. Consulter les échanges des étudiants
3. Attribuer des notes et commenter les échanges
4. Soumettre l'évaluation

### Administrateurs

1. Se connecter avec email et mot de passe
2. Gérer les comptes des examinateurs (ajouter, modifier, supprimer)
3. Gérer les comptes des étudiants (ajouter, modifier, supprimer)

## 🧪 Routes de test rapide

Pour faciliter les tests, des URLs de connexion rapide sont disponibles :

- `/test-login/student` - Connexion automatique en tant qu'étudiant
- `/test-login/examiner` - Connexion automatique en tant qu'examinateur
- `/test-login/admin` - Connexion automatique en tant qu'administrateur

## 🛠️ Structure du projet

```
.
├── frontend/                # Application React (Frontend)
│   ├── public/              # Fichiers statiques
│   ├── src/                 # Code source frontend
│   │   ├── components/      # Composants React
│   │   │   ├── auth/        # Composants d'authentification
│   │   │   └── dashboard/   # Tableaux de bord par rôle
│   │   ├── context/         # Contextes React (AuthContext)
│   │   ├── App.tsx          # Composant principal avec routage
│   │   ├── main.tsx         # Point d'entrée de l'application
│   │   └── types.ts         # Types TypeScript
│   └── ...                  # Fichiers de configuration
│
└── backend/                 # Serveur Express (Backend)
    ├── config/              # Configuration du serveur
    ├── controllers/         # Contrôleurs API
    ├── middleware/          # Middlewares Express
    ├── models/              # Modèles de données
    ├── routes/              # Routes API
    └── server.js            # Point d'entrée du serveur
```

## 🔧 Technologies utilisées

- **Frontend**

  - React
  - TypeScript
  - React Router
  - Tailwind CSS
  - Vite (build tool)
  - Lucide React (icônes)

- **Backend**
  - Express
  - Cors

## 🔮 Perspectives d'amélioration

- Intégration d'une vraie API d'IA (OpenAI, etc.)
- Système d'authentification complet avec JWT
- Base de données Mongo pour stocker les utilisateurs et interactions
- Système de reporting et d'analytics
- Tests unitaires et d'intégration
