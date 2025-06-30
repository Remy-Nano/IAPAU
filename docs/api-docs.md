# Documentation API - Prompt Challenge

## 1. Introduction

Cette documentation décrit l'API REST de la plateforme **Prompt Challenge**, une application éducative permettant aux étudiants d'interagir avec des modèles d'IA dans le cadre de hackathons pédagogiques.

### Informations générales

- **URL de base** : `https://votre-domaine.com/api` ou `http://localhost:3000/api`
- **Format de données** : JSON
- **Encodage** : UTF-8
- **Authentification** : JWT Bearer Token (pour certains endpoints)
- **Version** : 1.0

### Technologies utilisées

- **Framework** : Next.js 15 (App Router)
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JWT + liens magiques
- **Modèles IA** : OpenAI, Mistral AI
- **Validation** : Zod schemas

---

## 2. Authentification

### Types d'authentification

#### 2.1 Liens magiques (Étudiants)

Les étudiants utilisent des liens magiques envoyés par email.

#### 2.2 Credentials (Examinateurs/Admins)

Les examinateurs et admins utilisent email/mot de passe.

#### 2.3 Bearer Token

Certains endpoints nécessitent un token JWT dans le header :

```
Authorization: Bearer <your-jwt-token>
```

---

## 3. Codes de statut HTTP

| Code  | Signification         | Description                      |
| ----- | --------------------- | -------------------------------- |
| `200` | OK                    | Succès de la requête             |
| `201` | Created               | Ressource créée avec succès      |
| `204` | No Content            | Succès sans contenu de retour    |
| `400` | Bad Request           | Erreur de validation/syntaxe     |
| `401` | Unauthorized          | Token manquant ou invalide       |
| `404` | Not Found             | Ressource non trouvée            |
| `409` | Conflict              | Conflit (ex: email déjà utilisé) |
| `500` | Internal Server Error | Erreur serveur interne           |

---

## 4. Endpoints d'authentification

### 4.1 Connexion utilisateur

```http
POST /api/auth/login
```

**Description** : Initie la connexion pour tous types d'utilisateurs.

**Body** :

```json
{
  "email": "pierre.durand@example.fr"
}
```

**Réponse succès (200)** :

```json
{
  "role": "etudiant"
}
```

**Comportement** :

- **Étudiants** : Génère un lien magique envoyé par email
- **Autres rôles** : Retourne uniquement le rôle

**Erreurs** :

- `400` : Format email invalide
- `404` : Utilisateur non trouvé

---

### 4.2 Vérification lien magique

```http
GET /api/auth/magic-link/verify?token=<jwt-token>
```

**Description** : Vérifie et valide un lien magique étudiant.

**Paramètres query** :

- `token` (string, required) : Token JWT du lien magique

**Réponse succès (200)** :

```json
{
  "success": true,
  "user": {
    "email": "etudiant@example.com",
    "role": "etudiant",
    "prenom": "Jean",
    "nom": "Dupont"
  }
}
```

**Erreurs** :

- `400` : Token requis ou expiré
- `404` : Token invalide

---

## 5. Endpoints utilisateurs

### 5.1 Liste des utilisateurs

```http
GET /api/users
```

**Description** : Récupère tous les utilisateurs (admin uniquement).

**Réponse succès (200)** :

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@example.com",
    "role": "etudiant",
    "tokensAuthorized": 10000,
    "tokensUsed": 2500,
    "createdAt": "2024-12-15T10:00:00.000Z"
  }
]
```

---

### 5.2 Créer un utilisateur

```http
POST /api/users
```

**Description** : Crée un nouvel utilisateur.

**Body** :

```json
{
  "prenom": "Marie",
  "nom": "Martin",
  "email": "marie.martin@example.com",
  "role": "etudiant",
  "password": "motdepasse123",
  "tokensAuthorized": 15000
}
```

**Réponse succès (201)** :

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "prenom": "Marie",
  "nom": "Martin",
  "email": "marie.martin@example.com",
  "role": "etudiant",
  "tokensAuthorized": 15000,
  "tokensUsed": 0,
  "createdAt": "2024-12-15T11:00:00.000Z"
}
```

**Erreurs** :

- `409` : Email déjà utilisé
- `400` : Données de validation invalides

---

### 5.3 Utilisateur par ID

```http
GET /api/users/[id]
PUT /api/users/[id]
DELETE /api/users/[id]
```

#### GET - Récupérer un utilisateur

**Réponse succès (200)** :

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@example.com",
  "role": "etudiant"
}
```

#### PUT - Modifier un utilisateur

**Body** :

```json
{
  "prenom": "Jean-Pierre",
  "tokensAuthorized": 20000
}
```

**Réponse succès (200)** : Utilisateur mis à jour

#### DELETE - Supprimer un utilisateur

**Réponse succès (200)** :

```json
{
  "deleted": true,
  "message": "L'utilisateur a été supprimé avec succès"
}
```

---

### 5.4 Utilisateur actuel

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Description** : Récupère les informations de l'utilisateur connecté.

**Réponse succès (200)** :

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@example.com",
    "role": "etudiant",
    "tokensAuthorized": 10000,
    "tokensUsed": 2500
  }
}
```

---

### 5.5 Import CSV

```http
POST /api/users/import
Content-Type: multipart/form-data
```

**Description** : Importe des utilisateurs depuis un fichier CSV.

**Body** :

```
Form data:
- file: <CSV_FILE>
```

**Format CSV attendu** :

```csv
prenom,nom,email,role,password
Marie,Dubois,marie.dubois@example.com,etudiant,password123
Pierre,Martin,pierre.martin@example.com,examiner,password456
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "message": "Import terminé : 2 utilisateur(s) importé(s)",
  "imported": 2,
  "skipped": 0,
  "errors": []
}
```

---

## 6. Endpoints conversations

### 6.1 Liste des conversations

```http
GET /api/conversations
```

**Paramètres query** :

- `withFinalVersion` (boolean) : Filtrer les conversations avec version finale
- `hackathonId` (string) : Filtrer par hackathon
- `tacheId` (string) : Filtrer par tâche

**Exemple** :

```http
GET /api/conversations?withFinalVersion=true&hackathonId=507f1f77bcf86cd799439013
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "studentId": "507f1f77bcf86cd799439011",
      "hackathonId": "507f1f77bcf86cd799439013",
      "modelName": "gpt-3.5-turbo",
      "createdAt": "2024-12-15T10:00:00.000Z",
      "versionFinale": {
        "promptFinal": "Créez un chatbot intelligent",
        "reponseIAFinale": "Voici un exemple de chatbot...",
        "soumisLe": "2024-12-15T12:00:00.000Z"
      }
    }
  ]
}
```

---

### 6.2 Créer une conversation

```http
POST /api/conversations
```

**Body** :

```json
{
  "studentId": "507f1f77bcf86cd799439011",
  "hackathonId": "507f1f77bcf86cd799439013",
  "tacheId": "tache-1",
  "modelName": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Réponse succès (201)** :

```json
{
  "conversation": {
    "_id": "507f1f77bcf86cd799439021",
    "studentId": "507f1f77bcf86cd799439011",
    "hackathonId": "507f1f77bcf86cd799439013",
    "modelName": "gpt-3.5-turbo",
    "messages": [],
    "createdAt": "2024-12-15T14:00:00.000Z"
  }
}
```

---

### 6.3 Conversation spécifique

```http
GET /api/conversations/[id]
DELETE /api/conversations/[id]
```

#### GET - Récupérer une conversation

**Réponse succès (200)** :

```json
{
  "conversation": {
    "_id": "507f1f77bcf86cd799439021",
    "studentId": "507f1f77bcf86cd799439011",
    "messages": [
      {
        "role": "student",
        "content": "Bonjour, pouvez-vous m'aider ?",
        "createdAt": "2024-12-15T14:05:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Bien sûr ! Comment puis-je vous aider ?",
        "createdAt": "2024-12-15T14:05:02.000Z",
        "modelUsed": "gpt-3.5-turbo",
        "tokenCount": 12
      }
    ]
  }
}
```

#### DELETE - Supprimer une conversation

**Réponse succès (200)** :

```json
{
  "success": true
}
```

---

### 6.4 Ajouter un message

```http
POST /api/conversations/[id]/messages
```

**Body** :

```json
{
  "role": "student",
  "content": "Pouvez-vous expliquer les réseaux de neurones ?"
}
```

**Réponse succès (200)** :

```json
{
  "conversation": {
    "_id": "507f1f77bcf86cd799439021",
    "messages": [
      {
        "role": "student",
        "content": "Pouvez-vous expliquer les réseaux de neurones ?",
        "createdAt": "2024-12-15T14:10:00.000Z"
      }
    ]
  }
}
```

---

### 6.5 Générer réponse IA

```http
POST /api/conversations/[id]/ai-response
```

**Body** :

```json
{
  "prompt": "Expliquez les réseaux de neurones simplement",
  "modelName": "gpt-3.5-turbo",
  "maxTokens": 500
}
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439021",
    "messages": [
      {
        "role": "student",
        "content": "Expliquez les réseaux de neurones simplement",
        "createdAt": "2024-12-15T14:15:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Les réseaux de neurones sont des modèles informatiques inspirés du cerveau humain...",
        "createdAt": "2024-12-15T14:15:03.000Z",
        "modelUsed": "gpt-3.5-turbo",
        "tokenCount": 150
      }
    ]
  },
  "aiResponse": "Les réseaux de neurones sont des modèles informatiques inspirés du cerveau humain..."
}
```

---

### 6.6 Version finale

```http
PATCH /api/conversations/[id]/final
GET /api/conversations/[id]/final
```

#### PATCH - Enregistrer version finale

**Body** :

```json
{
  "finalText": "Voici ma réponse finale complète...",
  "promptFinal": "Mon prompt final optimisé",
  "maxTokensUsed": 750,
  "temperatureUsed": 0.8
}
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439021",
    "versionFinale": {
      "promptFinal": "Mon prompt final optimisé",
      "reponseIAFinale": "Voici ma réponse finale complète...",
      "soumisLe": "2024-12-15T15:00:00.000Z"
    }
  },
  "message": "Version finale enregistrée avec succès"
}
```

#### GET - Récupérer version finale

**Réponse succès (200)** :

```json
{
  "success": true,
  "promptFinal": "Mon prompt final optimisé",
  "finalText": "Voici ma réponse finale complète...",
  "finalVersionDate": "2024-12-15T15:00:00.000Z",
  "maxTokensUsed": 750,
  "temperatureUsed": 0.8,
  "conversation": {
    "modelName": "gpt-3.5-turbo",
    "statistiquesIA": {
      "modelUtilise": "gpt-3.5-turbo",
      "tokensTotal": 1250
    }
  }
}
```

---

### 6.7 Conversations par étudiant

```http
GET /api/conversations/student/[id]
```

**Paramètres query** :

- `includeMessages` (boolean) : Inclure tous les messages

**Réponse succès (200)** :

```json
{
  "success": true,
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "hackathonId": "507f1f77bcf86cd799439013",
      "modelName": "gpt-3.5-turbo",
      "createdAt": "2024-12-15T14:00:00.000Z",
      "messages": [
        {
          "role": "student",
          "content": "Premier message...",
          "createdAt": "2024-12-15T14:05:00.000Z"
        }
      ]
    }
  ]
}
```

---

## 7. Endpoints hackathons

### 7.1 Liste des hackathons

```http
GET /api/hackathons
```

**Réponse succès (200)** :

```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "nom": "Hackathon IA 2024",
    "description": "Découverte de l'intelligence artificielle",
    "dates": {
      "debut": "2024-12-01T09:00:00.000Z",
      "fin": "2024-12-20T17:00:00.000Z"
    },
    "statut": "En cours",
    "quotas": {
      "promptsParEtudiant": 50,
      "tokensParEtudiant": 10000
    },
    "taches": [
      "Créer un chatbot",
      "Générer du contenu",
      "Analyser des données"
    ],
    "anonymatActif": false,
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
]
```

---

### 7.2 Créer un hackathon

```http
POST /api/hackathons
```

**Body** :

```json
{
  "nom": "Nouveau Hackathon",
  "description": "Description du hackathon",
  "objectifs": "Objectifs pédagogiques",
  "dates": {
    "debut": "2024-12-25T09:00:00.000Z",
    "fin": "2024-12-30T17:00:00.000Z"
  },
  "quotas": {
    "promptsParEtudiant": 30,
    "tokensParEtudiant": 8000
  },
  "taches": ["Tâche 1", "Tâche 2"],
  "statut": "Brouillon",
  "anonymatActif": true
}
```

**Réponse succès (201)** :

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "nom": "Nouveau Hackathon",
  "description": "Description du hackathon",
  "statut": "Brouillon",
  "createdAt": "2024-12-15T16:00:00.000Z"
}
```

---

### 7.3 Hackathon spécifique

```http
GET /api/hackathons/[id]
PATCH /api/hackathons/[id]
DELETE /api/hackathons/[id]
```

#### GET - Récupérer un hackathon

**Paramètres query** :

- `tasksOnly` (boolean) : Retourner uniquement les tâches formatées

**Exemple avec tâches** :

```http
GET /api/hackathons/507f1f77bcf86cd799439013?tasksOnly=true
```

**Réponse avec tasksOnly=true (200)** :

```json
{
  "success": true,
  "taches": [
    {
      "id": "507f1f77bcf86cd799439013-task-0",
      "nom": "Créer un chatbot",
      "hackathonId": "507f1f77bcf86cd799439013"
    },
    {
      "id": "507f1f77bcf86cd799439013-task-1",
      "nom": "Générer du contenu",
      "hackathonId": "507f1f77bcf86cd799439013"
    }
  ]
}
```

#### PATCH - Modifier un hackathon

**Body** :

```json
{
  "statut": "En cours",
  "quotas": {
    "promptsParEtudiant": 60,
    "tokensParEtudiant": 12000
  }
}
```

#### DELETE - Supprimer un hackathon

**Réponse succès (204)** : Pas de contenu

---

## 8. Endpoints évaluations

### 8.1 Créer une évaluation

```http
POST /api/evaluations
```

**Body** :

```json
{
  "conversationId": "507f1f77bcf86cd799439021",
  "studentId": "507f1f77bcf86cd799439011",
  "examinerId": "507f1f77bcf86cd799439015",
  "note": 8,
  "comment": "Excellent travail ! Le prompt est bien structuré et la réponse IA est pertinente. Points d'amélioration : pourrait explorer des paramètres plus créatifs."
}
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "evaluation": {
    "_id": "507f1f77bcf86cd799439030",
    "conversationId": "507f1f77bcf86cd799439021",
    "studentId": "507f1f77bcf86cd799439011",
    "examinerId": "507f1f77bcf86cd799439015",
    "hackathonId": "507f1f77bcf86cd799439013",
    "tacheId": "tache-1",
    "note": 8,
    "comment": "Excellent travail ! Le prompt est bien structuré...",
    "gradedAt": "2024-12-15T16:30:00.000Z",
    "createdAt": "2024-12-15T16:30:00.000Z"
  }
}
```

**Erreurs** :

- `409` : Évaluation déjà existante pour cette combinaison examinateur/conversation
- `400` : Données de validation invalides

---

### 8.2 Évaluations par examinateur

```http
GET /api/evaluations/examiner/[id]
```

**Paramètres query** :

- `hackathonId` (string) : Filtrer par hackathon
- `tacheId` (string) : Filtrer par tâche

**Exemple** :

```http
GET /api/evaluations/examiner/507f1f77bcf86cd799439015?hackathonId=507f1f77bcf86cd799439013
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "evaluations": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "conversationId": "507f1f77bcf86cd799439021",
      "studentId": "507f1f77bcf86cd799439011",
      "hackathonId": "507f1f77bcf86cd799439013",
      "tacheId": "tache-1",
      "note": 8,
      "comment": "Excellent travail ! Le prompt est bien structuré...",
      "gradedAt": "2024-12-15T16:30:00.000Z"
    }
  ],
  "debug": {
    "examinerId": "507f1f77bcf86cd799439015",
    "hackathonId": "507f1f77bcf86cd799439013",
    "tacheId": "all",
    "totalFound": 1
  }
}
```

---

## 9. Endpoint de santé

### 9.1 Vérification santé

```http
GET /api/health
```

**Description** : Vérifie l'état de l'API et de la connexion MongoDB.

**Réponse succès (200)** :

```json
{
  "status": "ok",
  "mongoState": 1
}
```

**États MongoDB** :

- `0` : Déconnecté
- `1` : Connecté
- `2` : En cours de connexion
- `3` : En cours de déconnexion

**Réponse erreur (500)** :

```json
{
  "status": "error",
  "message": "Description de l'erreur"
}
```

---

## 10. Modèles de données

### 10.1 Utilisateur (User)

```typescript
interface IUser {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  role: "student" | "examiner" | "admin" | "etudiant" | "examinateur";
  passwordHash: string;
  tokensAuthorized?: number;
  tokensUsed?: number;
  numeroEtudiant?: string;
  dateNaissance?: Date;
  magicLink?: {
    token: string;
    expiresAt: Date;
  };
  profilEtudiant?: {
    niveauFormation: string;
    typeEtude: string;
    groupId?: string;
  };
  consentementRGPD?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 10.2 Conversation

```typescript
interface IConversation {
  _id: string;
  hackathonId?: string;
  tacheId?: string;
  studentId?: string;
  groupId?: string;
  modelName?: string;
  maxTokens?: number;
  maxTokensUsed?: number;
  temperature?: number;
  temperatureUsed?: number;
  messages: IMessage[];
  versionFinale?: IVersionFinale;
  statistiquesIA?: IStatistiquesIA;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessage {
  role: "student" | "assistant" | "system";
  content: string;
  createdAt: Date;
  tokenCount?: number;
  modelUsed?: string;
}

interface IVersionFinale {
  promptFinal: string;
  reponseIAFinale: string;
  soumisLe: Date;
}
```

---

### 10.3 Hackathon

```typescript
interface IHackathon {
  _id: string;
  nom: string;
  description: string;
  objectifs: string;
  dates: {
    debut: Date;
    fin: Date;
    archiveLe?: Date;
  };
  anonymatActif: boolean;
  quotas: {
    promptsParEtudiant: number;
    tokensParEtudiant: number;
  };
  taches: string[];
  statut: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 10.4 Évaluation

```typescript
interface IEvaluation {
  _id: string;
  conversationId: string;
  studentId: string;
  examinerId: string;
  hackathonId?: string;
  tacheId?: string;
  note: number; // Entre 1 et 10
  comment: string;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 11. Configuration IA

### 11.1 Modèles supportés

```json
{
  "openai": {
    "name": "OpenAI",
    "defaultModel": "gpt-3.5-turbo"
  },
  "mistral": {
    "name": "Mistral AI",
    "defaultModel": "mistral-medium"
  }
}
```

### 11.2 Paramètres par défaut

- **Tokens limite** : 10 000 par utilisateur
- **Temperature par défaut** : 0.7
- **MaxTokens par défaut** : 512

---

## 12. Gestion d'erreurs

### 12.1 Format des erreurs

```json
{
  "error": "Description de l'erreur",
  "details": "Informations supplémentaires (optionnel)"
}
```

### 12.2 Erreurs courantes

#### Validation Zod

```json
{
  "error": "Format email invalide"
}
```

#### Contraintes base de données

```json
{
  "error": "L'email jean.dupont@example.com est déjà utilisé par un autre utilisateur"
}
```

#### Ressource non trouvée

```json
{
  "error": "Conversation non trouvée"
}
```

#### Token invalide

```json
{
  "error": "Token invalide"
}
```

---

## 13. Exemples d'utilisation

### 13.1 Workflow étudiant complet

```javascript
// 1. Connexion étudiant
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "etudiant@example.com",
  }),
});

// 2. Vérification lien magique (depuis l'email)
const verifyResponse = await fetch(
  "/api/auth/magic-link/verify?token=JWT_TOKEN"
);
const { user } = await verifyResponse.json();

// 3. Création conversation
const conversationResponse = await fetch("/api/conversations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    studentId: user._id,
    hackathonId: "hackathon_id",
    modelName: "gpt-3.5-turbo",
  }),
});
const { conversation } = await conversationResponse.json();

// 4. Génération réponse IA
const aiResponse = await fetch(
  `/api/conversations/${conversation._id}/ai-response`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Expliquez-moi les réseaux de neurones",
      modelName: "gpt-3.5-turbo",
      maxTokens: 500,
    }),
  }
);

// 5. Soumission version finale
const finalResponse = await fetch(
  `/api/conversations/${conversation._id}/final`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      finalText: "Ma réponse finale...",
      promptFinal: "Mon prompt optimisé",
      maxTokensUsed: 450,
      temperatureUsed: 0.7,
    }),
  }
);
```

### 13.2 Workflow examinateur

```javascript
// 1. Récupération conversations à évaluer
const conversationsResponse = await fetch(
  "/api/conversations?withFinalVersion=true&hackathonId=HACKATHON_ID"
);
const { conversations } = await conversationsResponse.json();

// 2. Évaluation d'une conversation
const evaluationResponse = await fetch("/api/evaluations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    conversationId: "CONVERSATION_ID",
    studentId: "STUDENT_ID",
    examinerId: "EXAMINER_ID",
    note: 8,
    comment: "Excellent travail, bien structuré...",
  }),
});

// 3. Récupération des évaluations terminées
const myEvaluationsResponse = await fetch(
  "/api/evaluations/examiner/EXAMINER_ID"
);
const { evaluations } = await myEvaluationsResponse.json();
```

### 13.3 Workflow administrateur

```javascript
// 1. Import utilisateurs CSV
const formData = new FormData();
formData.append("file", csvFile);

const importResponse = await fetch("/api/users/import", {
  method: "POST",
  body: formData,
});

// 2. Création hackathon
const hackathonResponse = await fetch("/api/hackathons", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nom: "Nouveau Hackathon",
    description: "Description...",
    dates: {
      debut: "2024-12-25T09:00:00.000Z",
      fin: "2024-12-30T17:00:00.000Z",
    },
    quotas: {
      promptsParEtudiant: 30,
      tokensParEtudiant: 8000,
    },
    taches: ["Tâche 1", "Tâche 2"],
    statut: "En cours",
  }),
});
```

---

## 14. Bonnes pratiques

### 14.1 Sécurité

- **Toujours valider** les tokens JWT côté serveur
- **Utiliser HTTPS** en production
- **Nettoyer les données** avant insertion en base
- **Limiter les tentatives** de connexion

### 14.2 Performance

- **Paginer** les résultats pour les grandes collections
- **Utiliser lean()** pour les requêtes en lecture seule
- **Indexer** les champs de recherche fréquents
- **Mettre en cache** les réponses statiques

### 14.3 Maintenance

- **Logger** les erreurs importantes
- **Monitorer** l'état de la base de données
- **Sauvegarder** régulièrement les données
- **Versionner** les changements d'API
