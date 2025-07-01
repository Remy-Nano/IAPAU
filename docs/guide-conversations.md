# Guide Technique - Conversations IA

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
8. [Historique et pagination](#historique-et-pagination)
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
- **Historique** : Navigation dans l'historique des messages avec pagination

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
  promptType?: "one shot" | "contextuel"; // Type de prompt
  maxTokens?: number; // Limite de tokens par requête
  maxTokensUsed?: number; // Tokens réellement utilisés
  temperature?: number; // Paramètre de créativité (0.0-2.0)
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
- Quota tokens non épuisé

**Processus** :

1. **Validation** : Vérification du prompt et des quotas
2. **Ajout message utilisateur** : `POST /api/conversations/:id/messages`
3. **Génération réponse IA** : `POST /api/conversations/:id/ai-response`
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
  "modelName": "gpt-3.5-turbo",
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

#### Récupérer messages avec pagination

```http
GET /api/conversations/[id]/messages?page=1&limit=50
```

**Paramètres** :

- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de messages par page (max: 50)

### 4.3 Génération IA

#### Générer réponse IA

```http
POST /api/conversations/[id]/ai-response
Content-Type: application/json

{
  "prompt": "Expliquez les réseaux de neurones simplement",
  "modelName": "gpt-3.5-turbo",
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
  "aiResponse": "Les réseaux de neurones sont...",
  "tokenCount": 245
}
```

**Gestion des erreurs** :

```json
{
  "error": "Quota IA épuisé",
  "quotaExceeded": true,
  "tokensUsed": 9850,
  "tokensAuthorized": 10000
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
  min={0.1}
  max={2.0}
  step={0.1}
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

**Configuration** :

```typescript
// Configuration par défaut
const TOKEN_LIMITS = {
  defaultLimit: 10000, // Tokens par étudiant
  warningThreshold: 8000, // Seuil d'alerte
  criticalThreshold: 9500, // Seuil critique
};
```

**Structure utilisateur** :

```typescript
interface User {
  tokensAuthorized: number; // Tokens alloués
  tokensUsed: number; // Tokens consommés
}
```

### 6.2 Vérification des quotas

**Avant envoi de prompt** :

```typescript
const checkQuota = (user: User, estimatedTokens: number) => {
  const available = user.tokensAuthorized - user.tokensUsed;
  if (available < estimatedTokens) {
    throw new Error("Quota IA épuisé");
  }
  return true;
};
```

**Mise à jour après réponse** :

```typescript
const updateTokenUsage = async (userId: string, tokenCount: number) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { tokensUsed: tokenCount },
  });
};
```

### 6.3 Interface de quota épuisé

**Détection** :

```typescript
if (error.message === "Quota IA épuisé") {
  setIsDisabled(true);
  setShowQuotaExhausted(true);
}
```

**Affichage** :

```tsx
{
  quotaExhausted && (
    <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
      <p>Quota épuisé – Choisissez une réponse existante</p>
      <Button onClick={openExistingResponsesModal}>
        Choisir réponse existante
      </Button>
    </div>
  );
}
```

### 6.4 Modale de sélection des réponses existantes

**Déclencheur** : Bouton "Choisir réponse existante"
**Contenu** : Liste de toutes les réponses IA générées dans la conversation
**Endpoint** : `GET /api/conversations/:id/messages`

```tsx
const ExistingResponsesModal = ({ conversationId, onSelect }) => {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        const aiResponses = data.messages
          .filter((msg) => msg.role === "assistant")
          .map((msg) => ({
            content: msg.content,
            createdAt: msg.createdAt,
            tokenCount: msg.tokenCount,
          }));
        setResponses(aiResponses);
      });
  }, [conversationId]);

  return (
    <Dialog>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner une réponse existante</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {responses.map((response, index) => (
            <div key={index} className="border rounded p-4 mb-4">
              <p className="text-sm text-gray-500 mb-2">
                {format(new Date(response.createdAt), "dd/MM/yyyy HH:mm")}
                {response.tokenCount && ` • ${response.tokenCount} tokens`}
              </p>
              <p className="mb-3">{response.content}</p>
              <Button onClick={() => onSelect(response.content)}>
                Choisir cette réponse
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 7. Finalisation des conversations

### 7.1 Conditions de finalisation

**Déclencheurs** :

- Quota épuisé → Finalisation forcée
- Satisfaction de l'étudiant → Finalisation volontaire
- Fin du temps imparti → Finalisation automatique

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

## 8. Historique et pagination

### 8.1 Pagination des messages

**Problématique** : Les conversations longues (>50 messages) peuvent impacter les performances

**Solution** : Pagination côté serveur avec chargement à la demande

**Endpoint** :

```http
GET /api/conversations/[id]/messages?page=1&limit=50
```

**Paramètres** :

- `page` : Numéro de page (1-indexed)
- `limit` : Nombre de messages par page (max: 50, défaut: 50)

### 8.2 Chargement progressif (Frontend)

**Stratégie** : Infinite scroll vers le haut pour charger l'historique

```typescript
const MessagesWithPagination = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?page=${
          currentPage + 1
        }&limit=50`
      );
      const data = await response.json();

      if (data.messages.length < 50) {
        setHasMore(false);
      }

      // Ajouter les anciens messages au début du tableau
      setMessages((prevMessages) => [...data.messages, ...prevMessages]);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Détection du scroll vers le haut
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore) {
      loadMoreMessages();
    }
  };

  return (
    <ScrollArea onScroll={handleScroll} className="h-[600px]">
      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-600 rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">
            Chargement de l'historique...
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble
          key={`${message.createdAt}-${index}`}
          message={message}
        />
      ))}
    </ScrollArea>
  );
};
```

### 8.3 Optimisations base de données

**Index recommandés** :

```javascript
// MongoDB indexes pour performances
db.conversations.createIndex({ studentId: 1, createdAt: -1 });
db.conversations.createIndex({ hackathonId: 1, createdAt: -1 });
db.conversations.createIndex({ "messages.createdAt": -1 });
```

**Projection sélective** :

```typescript
// Charger conversation sans messages pour liste
const conversation = await Conversation.findById(id).select("-messages").lean();

// Charger seulement les messages nécessaires
const messages = await Conversation.findById(id)
  .select("messages")
  .slice("messages", [skip, limit])
  .lean();
```

---

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
  maxTokens: z.number().int().min(50).max(4000),
  temperature: z.number().min(0.1).max(2.0),
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

**Limitation par utilisateur** :

```typescript
const RATE_LIMITS = {
  messagesPerMinute: 10,
  messagesPerHour: 100,
  conversationsPerDay: 50,
};

const checkRateLimit = async (userId: string, action: string) => {
  const key = `rate_limit:${userId}:${action}`;
  const current = await redis.get(key);

  if (current && parseInt(current) >= RATE_LIMITS[action]) {
    throw new Error("Limite de fréquence dépassée");
  }

  await redis.incr(key);
  await redis.expire(key, 3600); // 1 heure
};
```

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
2. **Performance** : Pagination intelligente et optimisations de base de données
3. **Sécurité** : Validation rigoureuse et contrôle d'accès
4. **Expérience utilisateur** : Interface responsive avec retour temps réel
5. **Monitoring** : Suivi complet des métriques et statistiques

### Évolutions futures

- Support de nouveaux modèles IA (Claude, Gemini)
- Streaming de réponses en temps réel
- Collaboration en temps réel sur les conversations
- Analyse automatique de la qualité des prompts
- Suggestions d'amélioration basées sur l'IA
