# Guide Base de Données - Prompt Challenge

## 1. Vue d'ensemble

La plateforme **Prompt Challenge** utilise **MongoDB** comme base de données principale avec **Mongoose ODM** pour la modélisation et la validation des données. Cette architecture NoSQL est optimisée pour gérer les conversations IA, les évaluations et la gestion multi-rôles des utilisateurs.

### Principes de conception

- **Document-oriented** : Structure flexible pour conversations et évaluations
- **Relations référentielles** : Liens entre utilisateurs, hackathons et conversations
- **Validation stricte** : Schémas Mongoose avec contraintes métier
- **Index optimisés** : Performance et contraintes d'unicité
- **Timestamping automatique** : Traçabilité complète
- **Sécurité intégrée** : Sanitization et protection des données sensibles

---

## 2. Architecture de la base de données

### 2.1 Schéma relationnel conceptuel

```mermaid
graph TB
    User[👤 User] -->|1:N| Conversation[💬 Conversation]
    User -->|1:N| Evaluation[📊 Evaluation]
    Hackathon[🏆 Hackathon] -->|1:N| Conversation
    Conversation -->|1:1| Evaluation

    User -.->|roles| Student[🎓 Étudiant]
    User -.->|roles| Examiner[👨‍🏫 Examinateur]
    User -.->|roles| Admin[👨‍💼 Admin]

    Conversation -->|embedded| Messages[💭 Messages]
    Conversation -->|embedded| VersionFinale[📝 Version Finale]
    Conversation -->|embedded| StatistiquesIA[📈 Stats IA]
```

### 2.2 Collections principales

| Collection        | Documents   | Description                           |
| ----------------- | ----------- | ------------------------------------- |
| **users**         | ~100-1000   | Utilisateurs avec profils multi-rôles |
| **conversations** | ~1000-10000 | Conversations IA avec historique      |
| **hackathons**    | ~10-100     | Événements et configuration           |
| **evaluations**   | ~1000-5000  | Évaluations des jurys                 |

### 2.3 Taille estimée et performance

- **Volume total** : ~50MB-500MB (selon usage)
- **Documents moyens** :
  - User : ~2KB
  - Conversation : ~5-10KB (avec messages)
  - Hackathon : ~1KB
  - Evaluation : ~500B
- **Requêtes/sec** : ~100-1000 (pics pendant hackathons)

---

## 3. Modèle User (Utilisateurs)

### 3.1 Structure du document

```typescript
interface IUser {
  _id: ObjectId; // Identifiant unique MongoDB
  prenom: string; // Prénom (requis)
  nom: string; // Nom (requis)
  dateNaissance?: Date; // Date de naissance (optionnel)
  email: string; // Email unique (requis)
  numeroEtudiant?: string; // Numéro étudiant (optionnel)
  passwordHash: string; // Hash bcrypt du mot de passe
  role: UserRole; // Rôle utilisateur
  tokensAuthorized?: number; // Tokens autorisés
  tokensUsed?: number; // Tokens utilisés
  magicLink?: MagicLinkData; // Données lien magique
  profilEtudiant?: StudentProfile; // Profil étudiant
  profilJury?: JuryProfile; // Profil jury
  consentementRGPD?: boolean; // Consentement RGPD
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de mise à jour
}
```

### 3.2 Types de rôles

```typescript
type UserRole =
  | "student"
  | "examiner"
  | "admin"
  | "etudiant"
  | "examinateur"
  | "";

// Support bi-langue pour compatibilité
const VALID_ROLES = {
  etudiant: ["etudiant", "etudiants", "student", "students"],
  examinateur: ["examinateur", "examinateurs", "examiner", "examiners"],
  admin: ["admin", "admins", "administrateur", "administrateurs"],
};
```

### 3.3 Profils utilisateurs

#### 3.3.1 Profil Étudiant

```typescript
interface StudentProfile {
  niveauFormation: string; // Ex: "L3", "M1", "M2"
  typeEtude: string; // Ex: "Informatique", "Mathématiques"
  groupId?: string; // ID du groupe (optionnel)
}
```

#### 3.3.2 Profil Jury

```typescript
interface JuryProfile {
  niveauDiplome: string; // Ex: "Master", "Doctorat"
  posteOccupe: string; // Ex: "Développeur Senior"
  secteurActivite: string; // Ex: "Tech", "Finance"
  anneesExperience: number; // Années d'expérience
  nombreETPEmployeur: number; // Taille de l'entreprise
  expertises: Expertise[]; // Domaines d'expertise
}

interface Expertise {
  domaine: string; // Ex: "Machine Learning"
  niveauAutoEvaluation: number; // 1-10
}
```

### 3.4 Magic Link (Liens magiques)

```typescript
interface MagicLinkData {
  token: string; // Token JWT
  expiresAt: Date; // Date d'expiration (10 minutes)
}
```

### 3.5 Contraintes et validations

```javascript
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Contrainte d'unicité
    lowercase: true, // Normalisation automatique
    trim: true, // Suppression espaces
  },
  passwordHash: {
    type: String,
    required: true,
    select: false, // Exclusion par défaut des requêtes
  },
  role: {
    type: String,
    enum: ["student", "examiner", "admin", "etudiant", "examinateur", ""],
    default: "student",
  },
});
```

### 3.6 Index de performance

```javascript
// Index automatiques
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: 1 });

// Index composés recommandés
db.users.createIndex({ role: 1, createdAt: -1 });
```

---

## 4. Modèle Conversation

### 4.1 Structure du document

```typescript
interface IConversation {
  _id: ObjectId; // Identifiant unique
  hackathonId?: string; // Référence hackathon
  tacheId?: string; // ID de la tâche
  studentId?: string; // Référence utilisateur étudiant
  groupId?: string; // ID du groupe (optionnel)
  modelName?: string; // Modèle IA utilisé
  maxTokens?: number; // Limite de tokens
  maxTokensUsed?: number; // Tokens réellement utilisés
  temperature?: number; // Paramètre temperature
  temperatureUsed?: number; // Temperature réellement utilisée
  messages: IMessage[]; // Historique des messages
  versionFinale: IVersionFinale; // Version finale soumise
  statistiquesIA?: IStatistiquesIA; // Statistiques d'utilisation IA
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de mise à jour
}
```

### 4.2 Messages intégrés

```typescript
interface IMessage {
  role: "student" | "assistant" | "system"; // Rôle du message
  content: string; // Contenu du message
  createdAt: Date; // Timestamp du message
  tokenCount?: number; // Nombre de tokens
  modelUsed?: string; // Modèle utilisé pour ce message
}
```

**Types de messages** :

- **student** : Message de l'étudiant (prompt)
- **assistant** : Réponse de l'IA
- **system** : Messages système (configuration, erreurs)

### 4.3 Version finale

```typescript
interface IVersionFinale {
  promptFinal: string; // Prompt optimisé final
  reponseIAFinale: string; // Réponse IA finale choisie
  soumisLe: Date; // Date de soumission
}
```

### 4.4 Statistiques IA

```typescript
interface IStatistiquesIA {
  modelUtilise: string; // Modèle principal utilisé
  tokensTotal: number; // Total de tokens consommés
  coutEstime?: number; // Coût estimé en crédits
}
```

### 4.5 Modèles IA supportés

```typescript
// OpenAI
const OPENAI_MODELS = [
  "gpt-3.5-turbo", // Modèle rapide et économique
  "gpt-4", // Modèle avancé
  "gpt-4-turbo", // Modèle optimisé
];

// Mistral AI
const MISTRAL_MODELS = [
  "mistral-tiny", // Modèle léger
  "mistral-small", // Modèle équilibré
  "mistral-medium", // Modèle avancé
];
```

### 4.6 Paramètres de conversation

| Paramètre       | Plage     | Défaut | Description                  |
| --------------- | --------- | ------ | ---------------------------- |
| **temperature** | 0.1 - 2.0 | 0.7    | Créativité de l'IA           |
| **maxTokens**   | 50 - 4000 | 512    | Limite de tokens par réponse |

### 4.7 Index de performance

```javascript
// Index pour requêtes fréquentes
db.conversations.createIndex({ studentId: 1, createdAt: -1 });
db.conversations.createIndex({ hackathonId: 1, createdAt: -1 });
db.conversations.createIndex({ hackathonId: 1, studentId: 1 });

// Index pour version finale
db.conversations.createIndex({ "versionFinale.soumisLe": 1 });
```

---

## 5. Modèle Hackathon

### 5.1 Structure du document

```typescript
interface IHackathon {
  _id: ObjectId; // Identifiant unique
  nom: string; // Nom du hackathon (requis)
  description: string; // Description détaillée
  objectifs: string; // Objectifs pédagogiques
  dates: HackathonDates; // Dates importantes
  anonymatActif: boolean; // Mode anonyme activé
  quotas: HackathonQuotas; // Quotas par étudiant
  taches: string[]; // Liste des tâches
  statut: string; // Statut actuel
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de mise à jour
}
```

### 5.2 Gestion des dates

```typescript
interface HackathonDates {
  debut: Date; // Date de début
  fin: Date; // Date de fin
  archiveLe?: Date; // Date d'archivage (optionnel)
}
```

### 5.3 Système de quotas

```typescript
interface HackathonQuotas {
  promptsParEtudiant: number; // Nombre de prompts autorisés
  tokensParEtudiant: number; // Nombre de tokens autorisés
}
```

**Exemples de quotas** :

- **Hackathon court** : 10 prompts, 2000 tokens
- **Hackathon standard** : 30 prompts, 8000 tokens
- **Hackathon long** : 50 prompts, 15000 tokens

### 5.4 Statuts de hackathon

```typescript
type HackathonStatus =
  | "Brouillon" // En préparation
  | "En cours" // Actif
  | "Test" // Mode test
  | "Terminé" // Fini
  | "Archivé"; // Archivé

// Transitions valides
const STATUS_TRANSITIONS = {
  Brouillon: ["En cours", "Test"],
  Test: ["En cours", "Brouillon"],
  "En cours": ["Terminé"],
  Terminé: ["Archivé"],
};
```

### 5.5 Gestion des tâches

```typescript
// Exemples de tâches
const EXEMPLE_TACHES = [
  "Analyse de données avec IA",
  "Génération de code Python",
  "Rédaction technique assistée",
  "Création de chatbot",
  "Optimisation de prompts",
];
```

### 5.6 Index de performance

```javascript
// Index pour requêtes fréquentes
db.hackathons.createIndex({ statut: 1, "dates.debut": -1 });
db.hackathons.createIndex({ "dates.debut": 1, "dates.fin": 1 });
db.hackathons.createIndex({ nom: "text", description: "text" });
```

---

## 6. Modèle Evaluation

### 6.1 Structure du document

```typescript
interface IEvaluation {
  _id: ObjectId; // Identifiant unique
  conversationId: string; // Référence conversation (requis)
  studentId: string; // Référence étudiant (requis)
  examinerId: string; // Référence examinateur (requis)
  hackathonId?: string; // Référence hackathon (optionnel)
  tacheId?: string; // ID de la tâche (optionnel)
  note: number; // Note 1-10 (requis)
  comment: string; // Commentaire (requis)
  gradedAt: Date; // Date d'évaluation
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de mise à jour
}
```

### 6.2 Système de notation

```typescript
interface NotationScale {
  min: 1; // Note minimale
  max: 10; // Note maximale
  precision: 0.5; // Précision (demi-points)
}

// Échelle de notation
const ECHELLE_NOTATION = {
  1: "Très insuffisant",
  2: "Insuffisant",
  3: "Médiocre",
  4: "Passable",
  5: "Moyen",
  6: "Correct",
  7: "Bien",
  8: "Très bien",
  9: "Excellent",
  10: "Exceptionnel",
};
```

### 6.3 Contraintes d'intégrité

```javascript
const evaluationSchema = new Schema({
  note: {
    type: Number,
    required: true,
    min: [1, "La note doit être au minimum de 1"],
    max: [10, "La note doit être au maximum de 10"],
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "Le commentaire doit contenir au moins 10 caractères"],
  },
});

// Contrainte d'unicité : un examinateur = une évaluation par conversation
evaluationSchema.index({ examinerId: 1, conversationId: 1 }, { unique: true });
```

### 6.4 Relations et références

```javascript
// Relations conceptuelles (non enforced par MongoDB)
const RELATIONS = {
  evaluation_to_conversation: "1:1", // Une évaluation par conversation
  evaluation_to_examiner: "N:1", // Plusieurs évaluations par examinateur
  evaluation_to_student: "N:1", // Plusieurs évaluations par étudiant
  evaluation_to_hackathon: "N:1", // Plusieurs évaluations par hackathon
};
```

### 6.5 Index de performance

```javascript
// Index unique pour contrainte métier
db.evaluations.createIndex(
  { examinerId: 1, conversationId: 1 },
  { unique: true }
);

// Index pour requêtes fréquentes
db.evaluations.createIndex({ examinerId: 1, gradedAt: -1 });
db.evaluations.createIndex({ hackathonId: 1, note: -1 });
db.evaluations.createIndex({ studentId: 1, gradedAt: -1 });
```

---

## 7. Configuration de connexion

### 7.1 Paramètres de connexion MongoDB

```typescript
// Configuration optimisée pour production
const mongooseOptions = {
  bufferCommands: false, // Pas de mise en buffer
  maxPoolSize: 10, // Pool de 10 connexions max
  serverSelectionTimeoutMS: 5000, // Timeout sélection serveur
  socketTimeoutMS: 45000, // Timeout socket
  family: 4, // IPv4
  retryWrites: true, // Retry automatique
  readPreference: "primary", // Lecture sur primaire
};
```

### 7.2 Gestion de cache et reconnexion

```typescript
// Cache global pour éviter les reconnexions
declare global {
  var mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Fonction de connexion avec cache
export default async function connectDB(): Promise<Mongoose> {
  if (cache.conn) {
    return cache.conn; // Réutilisation connexion existante
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, options);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
```

### 7.3 Variables d'environnement

```bash
# Configuration MongoDB requise
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/prompt-challenge

# Options recommandées pour l'URI
?retryWrites=true
&w=majority
&readPreference=primary
&maxPoolSize=10
&serverSelectionTimeoutMS=5000
```

---

## 8. Requêtes et opérations courantes

### 8.1 Requêtes utilisateurs

```javascript
// Recherche utilisateur par email
const user = await User.findOne({ email: email.toLowerCase() })
  .select("-passwordHash") // Exclusion du hash
  .lean(); // Performance optimisée

// Utilisateurs par rôle avec pagination
const users = await User.find({ role: "student" })
  .sort({ createdAt: -1 })
  .limit(50)
  .skip(page * 50)
  .lean();

// Statistiques utilisateurs par rôle
const stats = await User.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

### 8.2 Requêtes conversations

```javascript
// Conversations d'un étudiant avec version finale
const conversations = await Conversation.find({
  studentId: userId,
  "versionFinale.promptFinal": { $ne: "" },
})
  .sort({ updatedAt: -1 })
  .lean();

// Conversations par hackathon avec statistiques
const conversationsWithStats = await Conversation.aggregate([
  { $match: { hackathonId: hackathonId } },
  {
    $addFields: {
      messageCount: { $size: "$messages" },
      totalTokens: { $sum: "$messages.tokenCount" },
    },
  },
  { $sort: { createdAt: -1 } },
]);
```

### 8.3 Requêtes évaluations

```javascript
// Évaluations d'un examinateur
const evaluations = await Evaluation.find({ examinerId })
  .sort({ gradedAt: -1 })
  .lean();

// Statistiques d'évaluation par hackathon
const evalStats = await Evaluation.aggregate([
  { $match: { hackathonId } },
  {
    $group: {
      _id: null,
      averageNote: { $avg: "$note" },
      totalEvaluations: { $sum: 1 },
      maxNote: { $max: "$note" },
      minNote: { $min: "$note" },
    },
  },
]);

// Vérification unicité avant création
const existingEval = await Evaluation.findOne({
  examinerId,
  conversationId,
});
```

### 8.4 Requêtes hackathons

```javascript
// Hackathons actifs avec filtrage dates
const activeHackathons = await Hackathon.find({
  statut: "En cours",
  "dates.debut": { $lte: new Date() },
  "dates.fin": { $gte: new Date() },
})
  .sort({ "dates.debut": -1 })
  .lean();

// Hackathon avec quotas détaillés
const hackathonDetails = await Hackathon.findById(hackathonId)
  .select("nom quotas taches dates statut")
  .lean();
```

---

## 9. Performance et optimisation

### 9.1 Index recommandés

```javascript
// Collection users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, createdAt: -1 });
db.users.createIndex({ "magicLink.expiresAt": 1 }, { expireAfterSeconds: 0 });

// Collection conversations
db.conversations.createIndex({ studentId: 1, updatedAt: -1 });
db.conversations.createIndex({ hackathonId: 1, createdAt: -1 });
db.conversations.createIndex({ hackathonId: 1, studentId: 1 });

// Collection evaluations
db.evaluations.createIndex(
  { examinerId: 1, conversationId: 1 },
  { unique: true }
);
db.evaluations.createIndex({ hackathonId: 1, gradedAt: -1 });

// Collection hackathons
db.hackathons.createIndex({ statut: 1, "dates.debut": -1 });
db.hackathons.createIndex({ "dates.debut": 1, "dates.fin": 1 });
```

### 9.2 Stratégies d'optimisation

#### 9.2.1 Requêtes optimisées

```javascript
// ✅ Bonne pratique : Utiliser lean() pour les lectures
const users = await User.find({ role: "student" }).lean();

// ✅ Projections sélectives
const users = await User.find({}, "nom prenom email role").lean();

// ✅ Pagination efficace
const users = await User.find({ role: "student" })
  .sort({ createdAt: -1 })
  .limit(20)
  .skip(page * 20)
  .lean();

// ❌ Éviter : Chargement de tous les documents
const users = await User.find({});
```

#### 9.2.2 Gestion des données volumineuses

```javascript
// Pagination des messages pour conversations longues
const conversation = await Conversation.findById(id)
  .select("-messages") // Exclure messages volumineux
  .lean();

// Chargement séparé des messages si nécessaire
const messages = await Conversation.findById(id, "messages")
  .slice("messages", [skip, limit]) // Pagination des messages
  .lean();
```

### 9.3 Monitoring et métriques

```javascript
// Monitoring des performances
mongoose.set("debug", process.env.NODE_ENV === "development");

// Métriques de performance
const connectionStats = {
  readyState: mongoose.connection.readyState,
  collections: Object.keys(mongoose.connection.collections).length,
  models: Object.keys(mongoose.models).length,
};

// Health check avec métriques
export async function getDatabaseHealth() {
  const start = Date.now();
  await mongoose.connection.db.admin().ping();
  const responseTime = Date.now() - start;

  return {
    status: "connected",
    responseTime: `${responseTime}ms`,
    collections: await mongoose.connection.db.collections(),
    indexes: await mongoose.connection.db.stats(),
  };
}
```

---

## 10. Sécurité et bonnes pratiques

### 10.1 Protection des données sensibles

```javascript
// Exclusion automatique des champs sensibles
const userSchema = new Schema({
  passwordHash: {
    type: String,
    required: true,
    select: false, // Exclusion par défaut
  },
  magicLink: {
    token: { type: String, select: false },
    expiresAt: { type: Date, select: false },
  },
});

// Nettoyage manuel dans les API
export async function getUserSafely(userId: string) {
  const user = await User.findById(userId).lean();
  if (user) {
    delete user.passwordHash;
    delete user.magicLink;
  }
  return user;
}
```

### 10.2 Validation et sanitization

```javascript
// Validation Mongoose
const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email requis"],
    unique: true,
    lowercase: true, // Normalisation
    trim: true, // Suppression espaces
    validate: {
      validator: function (email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: "Format email invalide",
    },
  },
});

// Protection contre l'injection NoSQL
const sanitizedQuery = {
  email: String(req.body.email).toLowerCase().trim(),
};
```

### 10.3 Audit et traçabilité

```javascript
// Timestamps automatiques
const schema = new Schema(
  {
    // ... champs
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Audit des modifications sensibles
schema.pre("save", function (next) {
  if (this.isModified("role") || this.isModified("email")) {
    console.log(`User modification: ${this._id} - ${this.email}`);
  }
  next();
});

// Soft delete pour les données critiques
schema.add({
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, default: null },
});
```

### 10.4 Gestion des erreurs

```javascript
// Gestion centralisée des erreurs MongoDB
export function handleMongoError(error: any) {
  if (error.code === 11000) {
    // Violation contrainte d'unicité
    const field = Object.keys(error.keyPattern)[0];
    return `${field} déjà utilisé`;
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return messages.join(", ");
  }

  return "Erreur de base de données";
}
```

---

## 11. Migration et maintenance

### 11.1 Scripts de migration

```javascript
// Migration ajout de champ
async function addConsentementRGPD() {
  await User.updateMany(
    { consentementRGPD: { $exists: false } },
    { $set: { consentementRGPD: false } }
  );
  console.log("Migration consentement RGPD terminée");
}

// Migration changement de structure
async function migrateUserProfiles() {
  const users = await User.find({ role: "student" });

  for (const user of users) {
    if (!user.profilEtudiant) {
      user.profilEtudiant = {
        niveauFormation: "",
        typeEtude: "",
        groupId: null,
      };
      await user.save();
    }
  }
}
```

### 11.2 Scripts de maintenance

```javascript
// Nettoyage des tokens expirés
async function cleanExpiredTokens() {
  const result = await User.updateMany(
    { "magicLink.expiresAt": { $lt: new Date() } },
    {
      $unset: {
        "magicLink.token": "",
        "magicLink.expiresAt": "",
      },
    }
  );
  console.log(`${result.modifiedCount} tokens expirés nettoyés`);
}

// Archivage des anciennes conversations
async function archiveOldConversations() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  await Conversation.updateMany(
    { createdAt: { $lt: sixMonthsAgo } },
    { $set: { archived: true } }
  );
}
```

### 11.3 Backup et restauration

```bash
# Backup complet
mongodump --uri="$MONGODB_URI" --out=./backup/$(date +%Y%m%d)

# Backup collection spécifique
mongodump --uri="$MONGODB_URI" --collection=users --out=./backup/users

# Restauration
mongorestore --uri="$MONGODB_URI" --drop ./backup/20241225
```

---

## 12. Développement et tests

### 12.1 Environnement de test

```javascript
// Configuration base de test
const TEST_DB_URI = "mongodb://localhost:27017/prompt-challenge-test";

// Setup avant tests
beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

// Nettoyage après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Fermeture après tests
afterAll(async () => {
  await mongoose.connection.close();
});
```

### 12.2 Données de test

```javascript
// Factory pour créer des utilisateurs de test
export const createTestUser = async (overrides = {}) => {
  return await User.create({
    prenom: "Test",
    nom: "User",
    email: `test${Date.now()}@example.com`,
    passwordHash: await bcrypt.hash("password123", 10),
    role: "student",
    ...overrides,
  });
};

// Factory pour conversations de test
export const createTestConversation = async (userId: string) => {
  return await Conversation.create({
    studentId: userId,
    modelName: "gpt-3.5-turbo",
    messages: [
      {
        role: "student",
        content: "Bonjour, comment ça va ?",
        createdAt: new Date(),
      },
    ],
  });
};
```

### 12.3 Tests d'intégration

```javascript
describe("User Model", () => {
  test("should create user with valid data", async () => {
    const userData = {
      prenom: "Jean",
      nom: "Dupont",
      email: "jean.dupont@example.com",
      passwordHash: "hashed_password",
      role: "student",
    };

    const user = await User.create(userData);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe("student");
  });

  test("should enforce email uniqueness", async () => {
    const email = "duplicate@example.com";

    await User.create({
      prenom: "User1",
      nom: "Test",
      email,
      passwordHash: "hash1",
      role: "student",
    });

    await expect(
      User.create({
        prenom: "User2",
        nom: "Test",
        email,
        passwordHash: "hash2",
        role: "examiner",
      })
    ).rejects.toThrow();
  });
});
```

---

## 13. Dépannage et résolution de problèmes

### 13.1 Problèmes de connexion

```javascript
// Diagnostic de connexion
export async function diagnoseMongoDB() {
  try {
    // Test de ping
    await mongoose.connection.db.admin().ping();
    console.log("✅ MongoDB ping successful");

    // Vérification des collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📁 Collections:",
      collections.map((c) => c.name)
    );

    // Statistiques de la base
    const stats = await mongoose.connection.db.stats();
    console.log("📊 Database stats:", {
      documents: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
    });
  } catch (error) {
    console.error("❌ MongoDB diagnosis failed:", error);
  }
}
```

### 13.2 Problèmes de performance

```javascript
// Profiling des requêtes lentes
mongoose.set("debug", true);

// Monitoring des opérations
const originalExec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = function () {
  const start = Date.now();
  const result = originalExec.apply(this, arguments);

  result.then(() => {
    const duration = Date.now() - start;
    if (duration > 100) {
      // Log des requêtes > 100ms
      console.warn(`Slow query (${duration}ms):`, this.getQuery());
    }
  });

  return result;
};
```

### 13.3 Problèmes d'intégrité des données

```javascript
// Vérification de l'intégrité référentielle
export async function checkDataIntegrity() {
  // Conversations sans utilisateur valide
  const orphanConversations = await Conversation.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "studentId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $match: { user: { $size: 0 } } },
    { $project: { _id: 1, studentId: 1 } },
  ]);

  if (orphanConversations.length > 0) {
    console.warn(
      "⚠️ Conversations orphelines trouvées:",
      orphanConversations.length
    );
  }

  // Évaluations sans conversation valide
  const orphanEvaluations = await Evaluation.aggregate([
    {
      $lookup: {
        from: "conversations",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversation",
      },
    },
    { $match: { conversation: { $size: 0 } } },
  ]);

  if (orphanEvaluations.length > 0) {
    console.warn(
      "⚠️ Évaluations orphelines trouvées:",
      orphanEvaluations.length
    );
  }
}
```

---

## 14. Évolutions futures

### 14.1 Optimisations prévues

#### 14.1.1 Sharding horizontal

```javascript
// Stratégie de sharding par hackathonId
sh.shardCollection("prompt-challenge.conversations", { hackathonId: 1 });
sh.shardCollection("prompt-challenge.evaluations", { hackathonId: 1 });
```

#### 14.1.2 Read replicas

```javascript
// Configuration read preference pour répartir la charge
const readOptions = {
  readPreference: "secondaryPreferred",
  readConcern: { level: "majority" },
};

// Requêtes de lecture sur replicas
const users = await User.find({}, null, readOptions);
```

### 14.2 Nouvelles fonctionnalités

#### 14.2.1 Versioning des documents

```javascript
// Ajout de versioning pour audit
const versionedSchema = new Schema({
  // ... champs existants
  version: { type: Number, default: 1 },
  history: [
    {
      version: Number,
      modifiedAt: Date,
      modifiedBy: String,
      changes: Schema.Types.Mixed,
    },
  ],
});
```

#### 14.2.2 Cache Redis intégré

```javascript
// Cache pour requêtes fréquentes
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

export async function getCachedHackathons() {
  const cached = await redis.get("hackathons:active");
  if (cached) return JSON.parse(cached);

  const hackathons = await Hackathon.find({ statut: "En cours" }).lean();
  await redis.setex("hackathons:active", 300, JSON.stringify(hackathons));

  return hackathons;
}
```

### 14.3 Analytics et reporting

```javascript
// Modèle pour analytics
const analyticsSchema = new Schema({
  type: String, // 'user_action', 'conversation_created', etc.
  userId: String,
  hackathonId: String,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// Collection avec TTL pour rotation automatique
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 jours
```

> 📝 **Note** : Ce guide documente la structure actuelle de la base de données. Pour toute modification des schémas en production, suivre les procédures de migration et valider en environnement de test au préalable.
