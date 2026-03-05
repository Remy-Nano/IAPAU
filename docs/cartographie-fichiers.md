# Cartographie des fichiers (qui dépend de quoi)

> Dernière mise à jour: 2026-02-13

## Objectif

Ce document explique rapidement:
- quel fichier fonctionne avec quel autre fichier,
- de quoi chaque partie a besoin,
- pourquoi elle existe.

## 1) Authentification

| Fichier | Dépend de | Utilisé par | Pourquoi |
|---|---|---|---|
| `src/components/auth/AuthManager.tsx` | `src/context/AuthContext.tsx` | `src/app/(frontend)/login/page.tsx` | Pilote le parcours de connexion (étudiant / examinateur / admin). |
| `src/context/AuthContext.tsx` | `/api/auth/login`, `/api/auth/credentials`, `/api/auth/magic-link/verify` | Composants d’auth frontend | Gère l’état connecté, le rôle, et le stockage local. |
| `src/app/(backend)/api/auth/login/route.ts` | `src/lib/models/user.ts`, `src/lib/mongoose.ts`, `src/lib/utils/email.ts`, `jsonwebtoken` | `AuthContext.loginWithEmail` | Détecte le rôle et déclenche le magic link pour étudiant. |
| `src/app/(backend)/api/auth/credentials/route.ts` | `src/lib/controllers/authController.ts`, `src/lib/mongoose.ts` | `AuthContext.loginWithCredentials` | Auth email/mot de passe (admin/examinateur). |
| `src/app/(backend)/api/auth/magic-link/verify/route.ts` | `src/lib/models/user.ts`, `jsonwebtoken`, `src/lib/mongoose.ts` | `AuthContext.loginWithMagicLink` | Vérifie le token de lien magique et ouvre une session JWT. |
| `src/lib/controllers/authController.ts` | `src/lib/models/user.ts`, `bcryptjs`, `jsonwebtoken` | Route credentials | Vérifie le mot de passe hashé et crée le JWT de session. |
| `middleware.ts` | `jsonwebtoken` | Toutes routes `/api/*` (hors publiques) | Refuse les appels API sans Bearer token valide. |

## 2) Utilisateurs (admin + import)

| Fichier | Dépend de | Utilisé par | Pourquoi |
|---|---|---|---|
| `src/app/(backend)/api/users/route.ts` | `src/lib/controllers/usrController.ts` | Pages admin users | Liste et création des utilisateurs. |
| `src/app/(backend)/api/users/[id]/route.ts` | `src/lib/controllers/usrController.ts` | Edition admin d’un utilisateur | Lecture / mise à jour / suppression par ID. |
| `src/app/(backend)/api/users/import/route.ts` | `src/lib/services/importService.ts`, `src/lib/mongoose.ts` | `src/components/admin/users/UserImportForm.tsx` | Import CSV massif. |
| `src/lib/services/importService.ts` | `src/lib/models/user.ts`, `bcryptjs`, `src/lib/utils/roleUtils.ts` | Route import CSV | Valide CSV et crée les comptes importés. |
| `src/lib/services/userService.ts` | `src/lib/models/user.ts`, `bcryptjs`, `src/lib/utils/roleUtils.ts` | Contrôleurs users | Logique métier utilisateur (création + validations). |

## 3) Conversations IA

| Fichier | Dépend de | Utilisé par | Pourquoi |
|---|---|---|---|
| `src/components/chat/ChatInterface.tsx` | Composants chat + client API | Dashboard étudiant | UI principale des conversations. |
| `src/lib/client/conversation.ts` | Endpoints `/api/conversations*` | Composants chat | Couche client pour appeler les routes conversations. |
| `src/app/(backend)/api/conversations/route.ts` | `src/lib/controllers/conversationController.ts` | Client conversation | Création/liste des conversations. |
| `src/app/(backend)/api/conversations/[id]/messages/route.ts` | Contrôleur conversation | Chat input | Ajoute un message étudiant dans une conversation. |
| `src/app/(backend)/api/conversations/[id]/ai-response/route.ts` | `src/lib/ai-service.ts`, contrôleur conversation | Chat interface | Génère la réponse IA (OpenAI/Mistral). |
| `src/app/(backend)/api/conversations/[id]/final/route.ts` | Contrôleur conversation | Bouton “version finale” | Marque une réponse comme version finale. |
| `src/lib/ai-service.ts` | SDK OpenAI/Mistral + config | Route `ai-response` | Appels modèles IA et paramètres (température/tokens). |

## 4) Hackathons et évaluations

| Fichier | Dépend de | Utilisé par | Pourquoi |
|---|---|---|---|
| `src/app/(backend)/api/hackathons/route.ts` | `src/lib/controllers/hackathonController.ts` | Dashboard admin / étudiant | CRUD hackathons. |
| `src/app/(backend)/api/hackathons/[id]/route.ts` | Contrôleur hackathon | Gestion admin | Opérations sur un hackathon précis. |
| `src/app/(backend)/api/evaluations/route.ts` | `src/lib/controllers/*`, modèles | Dashboard examinateur | Création et lecture des évaluations. |
| `src/app/(backend)/api/evaluations/examiner/[id]/route.ts` | Contrôleur évaluation | Dashboard examinateur | Récupère les évaluations d’un examinateur. |
| `src/app/(backend)/api/evaluations/student/[studentId]/route.ts` | Contrôleur évaluation | Dashboard étudiant résultats | Récupère les évaluations d’un étudiant. |

## 5) Modèles de données (base MongoDB)

| Fichier | Dépend de | Utilisé par | Pourquoi |
|---|---|---|---|
| `src/lib/models/user.ts` | Mongoose | Auth, users, import | Schéma utilisateur (rôle, hash, magicLink, profils). |
| `src/lib/models/conversation.ts` | Mongoose | Routes conversations, évaluations | Schéma des échanges IA et version finale. |
| `src/lib/models/hackathon.ts` | Mongoose | Routes hackathons | Schéma des hackathons, quotas, tâches. |
| `src/lib/models/evaluation.ts` | Mongoose | Routes évaluations | Schéma des notes/commentaires examinateur. |
| `src/lib/mongoose.ts` | `MONGODB_URI` | Toutes routes backend BD | Connexion unique à MongoDB. |

## 6) Documentation interne

| Fichier | Dépend de | Utilisé par | Pourquoi |
|---|---|---|---|
| `docs/api-docs.md` | Routes backend réelles | Dev/front/QA | Contrat API et exemples d’appel. |
| `docs/securite.md` | Flux auth + middleware | Dev/ops | Règles de sécurité et posture recommandée. |
| `docs/base-de-donnees.md` | Modèles Mongoose | Dev/data | Structure de la base et champs métiers. |
| `docs/guide-admin.md` | UI admin réelle | Admins | Procédures d’exploitation côté administration. |
| `docs/guide-etudiant.md` | UI étudiant réelle | Étudiants | Parcours d’usage étudiant. |
| `docs/guide-examinateur.md` | UI examinateur réelle | Jury | Parcours d’évaluation. |
| `docs/guide-conversations.md` | Chat + API conversations | Dev/produit | Vision technique du module conversation IA. |
| `docs/changelog.md` | Historique des changements | Toute l’équipe | Trace des mises à jour livrées. |

## 7) Variables d’environnement minimales

| Variable | Utilisée par | Pourquoi |
|---|---|---|
| `MONGODB_URI` | `src/lib/mongoose.ts` | Connexion base MongoDB. |
| `JWT_SECRET` | Routes auth + middleware | Signature/vérification des tokens JWT. |
| `NEXTAUTH_URL` | Route login magic link | Construire les URLs de redirection/lien. |
| `OPENAI_API_KEY` | `src/lib/ai-service.ts` | Appels OpenAI. |
| `MISTRAL_API_KEY` | `src/lib/ai-service.ts` | Appels Mistral. |
| `SMTP_HOST` | `src/lib/utils/email.ts` | Configuration du serveur SMTP (host). |
| `SMTP_PORT` | `src/lib/utils/email.ts` | Port SMTP (ex: 587). |
| `SMTP_USER` | `src/lib/utils/email.ts` | Identifiant SMTP d’authentification. |
| `SMTP_PASS` | `src/lib/utils/email.ts` | Secret SMTP d’authentification. |
| `SMTP_FROM` | `src/lib/utils/email.ts` | Adresse expéditeur SMTP des emails envoyés. |

## 8) Résumé ultra-court

- **Frontend auth** dépend de **AuthContext**, qui dépend des routes `/api/auth/*`.
- **Routes API** dépendent des **controllers/services**, qui dépendent des **models Mongoose**.
- **Toutes les données** passent par `src/lib/mongoose.ts` + `MONGODB_URI`.
- **La sécurité API** passe par `middleware.ts` + `JWT_SECRET`.
