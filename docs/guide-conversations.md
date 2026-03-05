# Guide Technique - Conversations IA

> Dernière révision: 2026-02-13 (alignement avec les routes backend actuelles)

**Plateforme Éducative Prompt Challenge**  
_Guide complet du système de conversations avec intelligence artificielle_

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Cycle de vie d'une conversation](#cycle-de-vie-dune-conversation)
4. [API et endpoints](#api-et-endpoints)
5. [Interface utilisateur](#interface-utilisateur)
6. [Gestion des quotas](#gestion-des-quotas)
7. [Finalisation des conversations](#finalisation-des-conversations)
8. [Historique des messages](#historique-des-messages)
9. [Sécurité et validation](#sécurité-et-validation)
10. [Monitoring et statistiques](#monitoring-et-statistiques)

---

## 1. Vue d'ensemble

### 1.1 Concept général

Le système de conversations IA permet aux étudiants d'interagir avec différents modèles d'intelligence artificielle (OpenAI, Mistral) dans le contexte de hackathons éducatifs. Chaque conversation est liée à une tâche spécifique et permet un échange itératif pour optimiser les prompts et obtenir les meilleures réponses possibles.

### 1.2 Fonctionnalités principales

- **Création de conversations** : Lancement de nouvelles conversations liées à des tâches
- **Envoi de prompts** : Saisie et envoi de messages vers les modèles IA
- **Configuration avancée** : Réglage de température, max_tokens, choix du modèle
- **Types de prompts** : Mode "one shot" ou "contextuel"
- **Gestion des quotas** : Limitation et monitoring des tokens utilisés
- **Finalisation** : Validation d'une réponse comme version finale
- **Historique** : Consultation de l'historique des messages d'une conversation

---

## 2. Architecture technique

### 2.1 Modèle de données

#### Conversation (IConversation)

```typescript
interface IConversation {
  _id: ObjectId; // Identifiant unique
  hackathonId?: string; // Référence hackathon
  tacheId?: string; // ID de la tâche
  studentId?: string; // Référence utilisateur étudiant
  groupId?: string; // ID du groupe (optionnel)
  modelName?: string; // Modèle IA utilisé
  titreConversation?: string; // Titre personnalisé
  promptType?: "one shot" | "contextuel"; // Type côté interface (non persisté de façon stricte en base)
  maxTokens?: number; // Limite de tokens par requête
  maxTokensUsed?: number; // Tokens réellement utilisés
  temperature?: number; // Paramètre de créativité (0.0-1.0)
  temperatureUsed?: number; // Temperature réellement utilisée
  messages: IMessage[]; // Historique des messages
  versionFinale: IVersionFinale; // Version finale soumise
  statistiquesIA?: IStatistiquesIA; // Statistiques d'utilisation
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de mise à jour
}
```

#### Message (IMessage)

```typescript
interface IMessage {
  role: "student" | "assistant" | "system"; // Rôle du message
  content: string; // Contenu du message
  createdAt: Date; // Timestamp du message
  tokenCount?: number; // Nombre de tokens
  modelUsed?: string; // Modèle utilisé pour ce message
}
```

#### Version finale (IVersionFinale)

```typescript
interface IVersionFinale {
  promptFinal: string; // Prompt optimisé final
  reponseIAFinale: string; // Réponse IA finale choisie
  soumisLe: Date; // Date de soumission
}
```

#### Statistiques IA (IStatistiquesIA)

```typescript
interface IStatistiquesIA {
  modelUtilise: string; // Modèle principal utilisé
  tokensTotal: number; // Total de tokens consommés
  coutEstime?: number; // Coût estimé en crédits
}
```

### 2.2 Composants React principaux

#### ChatInterface

- **Rôle** : Interface principale de chat
- **Fichier** : `src/components/chat/ChatInterface.tsx`
- **Fonctionnalités** :
  - Affichage des conversations existantes
  - Configuration des paramètres IA
  - Gestion de la finalisation
  - Intégration avec les autres composants

#### FixedPromptInput

- **Rôle** : Zone de saisie fixe en bas d'écran
- **Fichier** : `src/components/chat/FixedPromptInput.tsx`
- **Fonctionnalités** :
  - Saisie de prompts avec validation
  - Raccourcis clavier (Ctrl+Entrée)
  - États de chargement et désactivation

#### ConversationSidebar

- **Rôle** : Navigation entre conversations
- **Fichier** : `src/components/chat/ConversationSidebar.tsx`
- **Fonctionnalités** :
  - Liste des conversations
  - Filtrage par hackathon
  - Suppression de conversations
  - Indicateurs de statut (version finale)

#### ResponseList

- **Rôle** : Affichage des échanges prompt/réponse
- **Fichier** : `src/components/chat/ResponseList.tsx`
- **Fonctionnalités** :
  - Affichage chronologique des messages
  - Sélection de paires pour finalisation
  - Scroll automatique vers nouveaux messages

---

## 3. Cycle de vie d'une conversation

### 3.1 Création d'une conversation

**Déclencheur** : L'étudiant clique sur "Nouvelle conversation" ou sélectionne une tâche

**Processus** :

1. **Initialisation** : Création d'un objet conversation vide
2. **Configuration** : Définition des paramètres par défaut
   - `modelName`: "openai"
   - `temperature`: 0.7
   - `maxTokens`: 512
   - `promptType`: "one shot"
3. **Enregistrement** : Sauvegarde en base via `POST /api/conversations`

**Code exemple** :

```typescript
const newConversation = {
  studentId: user.id,
  hackathonId: selectedHackathon,
  tacheId: selectedTache,
  modelName: "openai",
  temperature: 0.7,
  maxTokens: 512,
  messages: [],
  versionFinale: {},
};
```

### 3.2 Envoi d'un prompt

**Prérequis** :

- Conversation active
- Prompt ≥ 5 caractères

**Processus** :

1. **Validation** : Vérification du prompt
2. **Ajout message utilisateur** : `POST /api/conversations/[id]/messages`
3. **Génération réponse IA** : `POST /api/conversations/[id]/ai-response`
4. **Mise à jour statistiques** : Comptage des tokens utilisés
5. **Rafraîchissement interface** : Affichage des nouveaux messages

**États de l'interface** :

```typescript
// Pendant l'envoi
setIsLoading(true);
setIsDisabled(true); // Désactiver le champ de saisie

// Affichage du spinner
<div className="animate-spin">Génération en cours...</div>;

// Après réception
setIsLoading(false);
setIsDisabled(false);
```

### 3.3 Gestion du contexte

#### Mode "one shot"

- Chaque prompt est traité indépendamment
- Pas d'historique dans la requête IA
- Réponses rapides et ciblées

#### Mode "contextuel"

- L'historique complet est envoyé à l'IA
- Continuité dans la conversation
- Consommation de tokens plus élevée

**Implémentation** :

```typescript
// Préparation du contexte pour l'IA
const messageHistory =
  promptType === "contextuel"
    ? conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    : []; // Tableau vide pour one shot
```

---

## 4. API et endpoints

### 4.1 Conversations - CRUD

#### Créer une conversation

```http
POST /api/conversations
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439011",
  "hackathonId": "507f1f77bcf86cd799439013",
  "tacheId": "tache-1",
  "modelName": "openai",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Réponse** :

```json
{
  "conversation": {
    "_id": "507f1f77bcf86cd799439021",
    "studentId": "507f1f77bcf86cd799439011",
    "messages": [],
    "createdAt": "2024-12-15T14:00:00.000Z"
  }
}
```

#### Récupérer une conversation

```http
GET /api/conversations/[id]
```

#### Supprimer une conversation

```http
DELETE /api/conversations/[id]
```

### 4.2 Messages

#### Ajouter un message

```http
POST /api/conversations/[id]/messages
Content-Type: application/json

{
  "role": "student",
  "content": "Expliquez les réseaux de neurones"
}
```

### 4.3 Génération IA

#### Générer réponse IA

```http
POST /api/conversations/[id]/ai-response
Content-Type: application/json

{
  "prompt": "Expliquez les réseaux de neurones simplement",
  "modelName": "openai",
  "maxTokens": 500,
  "temperature": 0.7
}
```

**Réponse** :

```json
{
  "success": true,
  "conversation": {
    /* conversation mise à jour */
  },
  "aiResponse": "Les réseaux de neurones sont..."
}
```

**Gestion des erreurs** :

```json
{
  "error": "Erreur avec l'API openai: <détail>"
}
```

### 4.4 Finalisation

#### Soumettre version finale

```http
PATCH /api/conversations/[id]/final
Content-Type: application/json

{
  "finalText": "Réponse IA sélectionnée",
  "promptFinal": "Prompt optimisé final",
  "maxTokensUsed": 750,
  "temperatureUsed": 0.7
}
```

#### Récupérer version finale

```http
GET /api/conversations/[id]/final
```

---

## 5. Interface utilisateur

### 5.1 Zone de saisie (FixedPromptInput)

**Position** : Fixe en bas d'écran
**Largeur** : Responsive (mobile → desktop)

**Fonctionnalités** :

- **Validation temps réel** : Minimum 5 caractères
- **Compteur de caractères** : 2000 caractères max
- **Raccourcis clavier** : Ctrl+Entrée pour envoyer
- **États visuels** : Loading, disabled, error

**Code exemple** :

```tsx
<Textarea
  placeholder="Posez votre question à l'IA..."
  className={`
    min-h-[80px] max-h-[200px] resize-none 
    ${isDisabled ? "bg-gray-50 text-gray-400" : "bg-white"}
  `}
  disabled={isLoading || isDisabled}
  onKeyDown={(e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  }}
/>
```

### 5.2 Configuration des paramètres

#### ModelSelect

```tsx
const AVAILABLE_MODELS = [
  { value: "openai", label: "OpenAI GPT", color: "green" },
  { value: "mistral", label: "Mistral AI", color: "blue" },
];
```

#### TemperatureSlider

```tsx
<Slider
  value={[temperature]}
  onValueChange={([value]) => setValue("temperature", value)}
  min={0}
  max={1}
  step={0.01}
  className="flex-1"
/>
```

#### MaxTokensSlider

```tsx
<Slider
  value={[maxTokens]}
  onValueChange={([value]) => setValue("maxTokens", value)}
  min={50}
  max={4000}
  step={50}
  className="flex-1"
/>
```

### 5.3 Affichage des réponses (ResponseList)

**Organisation** : Paires prompt/réponse chronologiques
**Sélection** : Radio boutons pour choisir la version finale
**Scroll** : Auto-scroll vers nouveaux messages

```tsx
const promptResponsePairs = [];
for (let i = 0; i < messages.length; i += 2) {
  if (i + 1 < messages.length) {
    const prompt = messages[i];
    const response = messages[i + 1];
    if (prompt.role === "user" && response.role === "ai") {
      promptResponsePairs.push({
        prompt: prompt.content,
        response: response.content,
      });
    }
  }
}
```

---

## 6. Gestion des quotas

### 6.1 Système de tokens

Le projet affiche les tokens consommés dans l'UI via `statistiquesIA.tokensTotal`
et un plafond visuel par défaut (`appConfig.tokens.defaultLimit = 10000`).

```typescript
const tokensUsed = conversation.statistiquesIA?.tokensTotal ?? 0;
const tokensAuthorized = appConfig.tokens.defaultLimit; // 10000
```

**Structure utilisateur** :

```typescript
interface User {
  tokensAuthorized: number; // Tokens alloués
  tokensUsed: number; // Tokens consommés
}
```

### 6.2 État actuel des quotas

- Le backend met à jour `conversation.statistiquesIA.tokensTotal` via l'ajout des messages assistant.
- L'interface affiche un compteur de progression.
- Il n'y a pas de blocage serveur strict implémenté aujourd'hui sur un quota utilisateur global.

## 7. Finalisation des conversations

### 7.1 Conditions de finalisation

**Déclencheurs** :

- Satisfaction de l'étudiant → Finalisation volontaire
- Finalisation manuelle de la meilleure paire prompt/réponse

**Prérequis** :

- Au moins une paire prompt/réponse
- Sélection d'une réponse spécifique

### 7.2 Processus de finalisation

**Étape 1 : Sélection**

```typescript
const handlePairSelection = (pairIndex: number) => {
  setValue("selectedPair", pairIndex);

  const selectedPair = promptResponsePairs[pairIndex];
  setSelectedFinalPrompt(selectedPair.prompt);
  setSelectedFinalResponse(selectedPair.response);
};
```

**Étape 2 : Validation**

```typescript
const validateFinalSubmission = (data: ChatData) => {
  if (!conversationId) {
    throw new Error("Aucune conversation active");
  }

  if (data.selectedPair === null || data.selectedPair === undefined) {
    throw new Error("Veuillez sélectionner une réponse");
  }

  return true;
};
```

**Étape 3 : Soumission**

```typescript
const submitFinalVersion = async (data: ChatData) => {
  const selectedPair = promptResponsePairs[data.selectedPair];

  const response = await axios.patch(
    `/api/conversations/${conversationId}/final`,
    {
      finalText: selectedPair.response,
      promptFinal: selectedPair.prompt,
      maxTokensUsed: data.maxTokens,
      temperatureUsed: data.temperature,
    }
  );

  setShowSuccessDialog(true);
  return response.data;
};
```

### 7.3 État post-finalisation

**Modifications de l'interface** :

- Zone de saisie désactivée
- Message informatif affiché
- Boutons d'action masqués
- Badge "Finalisé" sur la conversation

```tsx
const isFinalized = Boolean(
  conversationData?.versionFinale?.promptFinal &&
    conversationData?.versionFinale?.reponseIAFinale
);

{
  isFinalized && (
    <div className="bg-green-100 border border-green-400 p-4 rounded">
      <div className="flex items-center">
        <Check className="h-5 w-5 text-green-600 mr-2" />
        <span className="text-green-800 font-medium">
          Conversation finalisée
        </span>
      </div>
    </div>
  );
}
```

### 7.4 Page de consultation des versions finales

**Route** : `/version-finale/[id]`
**Fichier** : `src/app/version-finale/[id]/page.tsx`

**Contenu affiché** :

- Prompt final optimisé
- Réponse IA finale sélectionnée
- Métadonnées (date, tokens utilisés, température)
- Statistiques de la conversation

---

## 8. Historique des messages

L'historique est stocké directement dans le document conversation (`messages[]`).
Il n'y a pas d'endpoint dédié de pagination des messages dans l'API actuelle.

## 9. Sécurité et validation

### 9.1 Validation des inputs

#### Côté client (React Hook Form)

```typescript
const promptValidation = {
  required: "Le message est obligatoire",
  minLength: {
    value: 5,
    message: "Message trop court (minimum 5 caractères)",
  },
  maxLength: {
    value: 2000,
    message: "Message trop long (maximum 2000 caractères)",
  },
};
```

#### Côté serveur (Zod)

```typescript
const promptSchema = z.object({
  prompt: z
    .string()
    .min(5, "Message trop court")
    .max(2000, "Message trop long"),
  modelName: z.enum(["openai", "mistral"]),
  maxTokens: z.number().int().min(100).max(2048),
  temperature: z.number().min(0).max(1),
});
```

### 9.2 Sécurisation des API

**Authentification** :

```typescript
// Middleware d'authentification
const authenticateUser = async (request: Request) => {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new Error("Token manquant");
  }

  const user = await verifyJWT(token);
  return user;
};
```

**Autorisation** :

```typescript
// Vérifier que l'utilisateur possède la conversation
const authorizeConversationAccess = async (
  userId: string,
  conversationId: string
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || conversation.studentId !== userId) {
    throw new Error("Accès non autorisé");
  }
  return conversation;
};
```

**Sanitisation** :

```typescript
// Protection contre injection NoSQL
const sanitizeInput = (input: string) => {
  return input.trim().replace(/[<>]/g, "");
};
```

### 9.3 Rate limiting

Le projet ne possède pas actuellement de mécanisme Redis de rate limiting.
La protection active repose sur le middleware JWT et la validation serveur.

---

## 10. Monitoring et statistiques

### 10.1 Métriques de performance

**Temps de réponse IA** :

```typescript
const trackAIResponseTime = async (modelName: string, startTime: number) => {
  const duration = Date.now() - startTime;

  // Log pour monitoring
  console.log(`AI Response Time: ${duration}ms for model ${modelName}`);

  // Métrique pour tableau de bord
  await saveMetric({
    type: "ai_response_time",
    value: duration,
    model: modelName,
    timestamp: new Date(),
  });
};
```

**Usage des tokens** :

```typescript
const trackTokenUsage = async (
  userId: string,
  tokenCount: number,
  modelName: string
) => {
  await TokenUsageLog.create({
    userId,
    tokenCount,
    modelName,
    timestamp: new Date(),
    conversationId: conversationId,
  });
};
```

### 10.2 Statistiques par conversation

**Collecte automatique** :

```typescript
const generateConversationStats = (conversation: IConversation) => {
  const stats = {
    messageCount: conversation.messages.length,
    totalTokens: conversation.statistiquesIA?.tokensTotal || 0,
    averageResponseTime: calculateAverageResponseTime(conversation.messages),
    modelUsage: getModelUsageBreakdown(conversation.messages),
    conversationDuration: getConversationDuration(conversation),
    promptTypes: getPromptTypeDistribution(conversation.messages),
  };

  return stats;
};
```

### 10.3 Dashboard administrateur

**Métriques globales** :

- Nombre total de conversations
- Tokens consommés par modèle
- Temps de réponse moyen
- Taux de finalisation
- Conversations les plus actives

**Alertes** :

- Quotas approchant les limites
- Temps de réponse IA anormalement élevés
- Erreurs fréquentes sur un modèle
- Pic d'utilisation inhabituel

---

## Conclusion

Le système de conversations IA de la plateforme Prompt Challenge offre une expérience complète et sécurisée pour l'interaction avec différents modèles d'intelligence artificielle. L'architecture modulaire permet une maintenance aisée et une évolutivité importante.

### Points clés à retenir

1. **Flexibilité** : Support de multiples modèles IA avec configuration personnalisable
2. **Performance** : Optimisations de base de données et streaming SSE
3. **Sécurité** : Validation rigoureuse et contrôle d'accès
4. **Expérience utilisateur** : Interface responsive avec retour temps réel
5. **Monitoring** : Suivi complet des métriques et statistiques

### Évolutions futures

- Support de nouveaux modèles IA (Claude, Gemini)
- Streaming de réponses en temps réel
- Collaboration en temps réel sur les conversations
- Analyse automatique de la qualité des prompts
- Suggestions d'amélioration basées sur l'IA
