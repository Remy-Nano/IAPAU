# Cours Projet - Architecture, Fichiers, Fonctions Principales

Objectif: apprendre le projet par blocs techniques, avec pour chaque bloc:
1. les fichiers,
2. les fonctions principales,
3. le flux d'appel.

---

## 1) Vue d'ensemble (a reciter)
Le projet est full-stack Next.js.
Le front est en React (`.tsx`) dans `src/app/(frontend)` et `src/components`.
Le back est en routes API (`route.ts`) dans `src/app/(backend)/api`.
La logique metier est dans `src/lib/controllers` et `src/lib/services`.
La base est MongoDB via Mongoose (`src/lib/mongoose.ts` + `src/lib/models`).

Schema mental:
UI (`tsx`) -> `fetch("/api/...")` -> `route.ts` -> service/controller -> model Mongoose -> MongoDB -> JSON -> UI.

---

## 1 bis) Parcours d'apprentissage par flux (ordre conseille)
Lis et apprends dans cet ordre, flux par flux:
1. Flux Login etudiant (magic link)
2. Flux Login admin/examinateur (credentials)
3. Flux Protection API (middleware)
4. Flux Creation utilisateur admin
5. Flux Import CSV utilisateurs
6. Flux CRUD hackathons
7. Flux Deploy CI/CD

Pour chaque flux, tu recites:
1. Declencheur
2. Fichiers traverses
3. Chemin technique exact
4. Resultat final

### Flux 1 - Login etudiant (magic link)
Declencheur:
L'etudiant saisit son email sur l'ecran de login.

Fichiers traverses:
- `src/components/auth/AuthManager.tsx`
- `src/context/AuthContext.tsx`
- `src/app/(backend)/api/auth/login/route.ts`
- `src/lib/models/user.ts`
- `src/lib/utils/email.ts`
- `src/app/(frontend)/magic-link/verify/page.tsx`
- `src/app/(backend)/api/auth/magic-link/verify/route.ts`

Chemin technique exact:
`AuthManager` -> `loginWithEmail()` -> `POST /api/auth/login` -> generation + stockage magic link -> clic lien -> page verify -> `GET /api/auth/magic-link/verify` -> token session.

Resultat final:
Utilisateur connecte, redirection vers dashboard etudiant.

### Flux 2 - Login admin/examinateur (credentials)
Declencheur:
Admin/examinateur saisit email + mot de passe.

Fichiers traverses:
- `src/components/auth/AuthManager.tsx`
- `src/context/AuthContext.tsx`
- `src/app/(backend)/api/auth/credentials/route.ts`
- `src/lib/controllers/authController.ts`
- `src/lib/models/user.ts`

Chemin technique exact:
`handleAdminLogin/handleExaminerLogin` -> `loginWithCredentials()` -> `POST /api/auth/credentials` -> `authController.login()` -> verification bcrypt -> JWT session.

Resultat final:
Token et user renvoyes, redirection dashboard admin ou examinateur.

### Flux 3 - Protection API (middleware)
Declencheur:
Toute requete sur `/api/*`.

Fichiers traverses:
- `middleware.ts`

Chemin technique exact:
Requete API -> check route publique/privee -> lecture `Authorization` -> `jwt.verify`.

Resultat final:
`NextResponse.next()` si token valide, sinon `401`.

### Flux 4 - Creation utilisateur admin
Declencheur:
Admin soumet formulaire creation user.

Fichiers traverses:
- `src/components/admin/users/UserCreateForm.tsx`
- `src/app/(backend)/api/users/route.ts`
- `src/lib/services/userService.ts`
- `src/lib/models/user.ts`

Chemin technique exact:
Submit form -> `POST /api/users` -> `createUser(data)` -> validation + hash password + insert Mongo.

Resultat final:
User cree (`201`) ou erreur metier (`400/409`).

### Flux 5 - Import CSV utilisateurs
Declencheur:
Admin upload un fichier CSV.

Fichiers traverses:
- `src/components/admin/users/UserImportForm.tsx`
- `src/app/(backend)/api/users/import/route.ts`
- `src/lib/services/importService.ts`
- `src/lib/models/user.ts`

Chemin technique exact:
Upload multipart -> `POST /api/users/import` -> `processCSVImport(file)` -> parse + validation + creations.

Resultat final:
Resume import `{ imported, warnings, errors }`.

### Flux 6 - CRUD hackathons
Declencheur:
Admin consulte/cree/modifie/supprime un hackathon.

Fichiers traverses:
- `src/services/hackathonService.ts` (cote front)
- `src/app/(backend)/api/hackathons/route.ts`
- `src/app/(backend)/api/hackathons/[id]/route.ts`
- `src/lib/services/hackathonService.ts` (cote backend, si utilise)
- `src/lib/models/hackathon.ts`

Chemin technique exact:
UI -> appels Axios `GET/POST/PATCH/DELETE /api/hackathons*` -> routes API -> DB.

Resultat final:
Etat hackathon persiste en base et reflété dans l'UI.

### Flux 7 - Deploy CI/CD
Declencheur:
Push `main` apres CI ou lancement manuel workflow.

Fichiers traverses:
- `.github/workflows/ci-e2e.yml`
- `.github/workflows/cd-ovh.yml`
- `Dockerfile`

Chemin technique exact:
CI (install/build/tests) -> CD (SSH OVH -> git pull -> docker build -> docker run -> healthcheck).

Resultat final:
Nouvelle version en ligne; si echec, job failed + rollback manuel.

---

## 2) Regles de types de fichiers
`page.tsx`: page front rendue au navigateur.
`component.tsx`: composant UI reutilisable.
`route.ts`: endpoint HTTP backend (GET/POST/PUT/DELETE).
`*.service.ts`: logique metier reutilisable.
`*.controller.ts`: orchestration metier backend.
`*.model.ts`: schema et acces DB.

---

## 3) Bloc Authentification (le plus important)

### 3.1 Fichiers a connaitre
- `src/app/(backend)/api/auth/login/route.ts`
- `src/app/(backend)/api/auth/credentials/route.ts`
- `src/app/(backend)/api/auth/magic-link/verify/route.ts`
- `src/lib/controllers/authController.ts`
- `src/context/AuthContext.tsx`
- `src/components/auth/AuthManager.tsx`
- `src/app/(frontend)/magic-link/verify/page.tsx`
- `src/lib/client/magic-link.ts`
- `middleware.ts`

### 3.2 Fonctions principales
`POST` dans `api/auth/login/route.ts`:
- lit `email` et `password` (zod),
- si `password` present: delegue a `/api/auth/credentials`,
- sinon cherche user en DB,
- si etudiant: genere token magic link (10 min), le stocke en DB, envoie email,
- renvoie role ou erreur.

`POST` dans `api/auth/credentials/route.ts`:
- valide input,
- `connectDB()`,
- appelle `login({ email, password })`,
- autorise uniquement `admin|examiner|examinateur`,
- renvoie `{ token, user }`.

`login()` dans `src/lib/controllers/authController.ts`:
- `User.findOne({ email })`,
- `bcrypt.compare(password, user.passwordHash)`,
- `jwt.sign({ sub, role }, JWT_SECRET, { expiresIn: "1h" })`,
- retire `passwordHash` avant retour.

`GET` dans `api/auth/magic-link/verify/route.ts`:
- lit `token` query param,
- verifie signature JWT et expiration,
- verifie token stocke en DB + `magicLink.expiresAt`,
- genere token session 1h,
- invalide magic link en DB,
- renvoie `{ token, user }`.

`AuthProvider` dans `src/context/AuthContext.tsx`:
- `loginWithEmail()` appelle `/api/auth/login`,
- `loginWithCredentials()` appelle `/api/auth/credentials`,
- `loginWithMagicLink()` appelle `/api/auth/magic-link/verify`,
- stocke `user` et `userRole` en localStorage.

`AuthManager` dans `src/components/auth/AuthManager.tsx`:
- orchestre les etapes UI login,
- route vers ecran etudiant/examinateur/admin,
- redirige vers dashboards apres succes.

`verifyMagicLinkAndRedirect()` dans `src/lib/client/magic-link.ts`:
- appelle `loginWithMagicLink(token)`,
- redirige vers `/dashboard/student`.

### 3.3 Flux d'appel (a reciter)
Etudiant:
`InitialAuth` -> `AuthContext.loginWithEmail` -> `POST /api/auth/login` -> email magic link ->
page verify -> `loginWithMagicLink` -> `GET /api/auth/magic-link/verify` -> token session -> dashboard etudiant.

Admin/Examinateur:
form credentials -> `AuthContext.loginWithCredentials` -> `POST /api/auth/credentials` ->
`authController.login` -> token session -> dashboard role.

---

## 4) Bloc Securite API

### 4.1 Fichier
- `middleware.ts`

### 4.2 Fonction principale
`middleware(req)`:
- laisse passer routes publiques: `/api/auth*`, `/api/health`,
- protege `/api/*`,
- lit `Authorization: Bearer <token>`,
- `jwt.verify(token, JWT_SECRET)`,
- sinon reponse `401`.

### 4.3 A dire au jury
Le middleware fait un controle d'authentification transverse.
Sans token valide, aucune route API privee n'est accessible.

---

## 5) Bloc Base de donnees

### 5.1 Fichiers
- `src/lib/mongoose.ts`
- `src/lib/models/user.ts`

### 5.2 Fonctions principales
`connectDB()` dans `src/lib/mongoose.ts`:
- verifie `MONGODB_URI`,
- reutilise une connexion cachee (`mongooseCache`) en dev/hot reload,
- sinon ouvre connexion Mongo.

`User` model dans `src/lib/models/user.ts`:
- schema utilisateur (prenom, nom, email, passwordHash, role, magicLink, profils...),
- normalise email (`lowercase`, `trim`, `unique`).

---

## 6) Bloc Utilisateurs (admin)

### 6.1 Fichiers
- `src/app/(backend)/api/users/route.ts`
- `src/app/(backend)/api/users/[id]/route.ts`
- `src/app/(backend)/api/users/import/route.ts`
- `src/lib/services/userService.ts`
- `src/lib/services/importService.ts`

### 6.2 Fonctions principales
`GET /api/users`:
- `connectDB()`,
- `getAllUsers()`,
- renvoie liste.

`POST /api/users`:
- `connectDB()`,
- `createUser(data)`,
- renvoie user cree (`201`) ou erreur (`400/409`).

`createUser(data)` dans `userService.ts`:
- valide champs obligatoires,
- normalise role,
- verifie email unique,
- hash password (`bcrypt.hash`),
- cree user avec valeurs par defaut.

`processCSVImport(file)` dans `importService.ts`:
- verifie format CSV,
- verifie colonnes obligatoires,
- parse lignes,
- ignore doublons email,
- cree users importes + warnings/errors.

---

## 7) Bloc Front Auth (ou part le code UI)

### 7.1 Fichiers front
- `src/app/(frontend)/login/page.tsx`
- `src/components/auth/AuthManager.tsx`
- `src/components/auth/InitialAuth.tsx`
- `src/components/auth/StudentAuth.tsx`
- `src/components/auth/ExaminerAuth.tsx`
- `src/components/auth/AdminAuth.tsx`
- `src/app/(frontend)/magic-link/verify/page.tsx`

### 7.2 Ce qui se passe quand j'ecris un formulaire
Le formulaire est en `.tsx`.
Au `submit`, il appelle une fonction handler.
Le handler fait `fetch("/api/...")`.
La route backend `route.ts` traite la requete.
Le front recupere JSON et met a jour l'UI (erreur, toast, redirect).

---

## 8) Bloc CI/CD et deploy

### 8.1 Fichiers
- `.github/workflows/ci-e2e.yml`
- `.github/workflows/cd-ovh.yml`
- `Dockerfile`

### 8.2 Ce qu'il faut savoir dire
CI:
- installe deps,
- build Next,
- lance app,
- verifie `/api/health`,
- execute tests E2E Playwright.

CD:
- declenche apres CI succes (main) ou manuel,
- SSH sur VPS OVH,
- `git pull`,
- `docker build`,
- restart conteneur `studia`,
- healthcheck.

En cas d'echec deploy:
- job GitHub failed,
- rollback manuel image precedente.

---

## 9) Variables d'environnement critiques
`MONGODB_URI`: connexion MongoDB.
`JWT_SECRET`: signature/verif JWT.
`NEXTAUTH_URL`: base URL pour liens magic link.
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: envoi email.
`E2E_TESTING`: comportement specifique tests.

---

## 10) Trame orale "fichier -> fonction -> effet"
Quand je presente un fichier, je dis toujours:
1. role du fichier,
2. fonction principale,
3. qui l'appelle,
4. ce qu'il renvoie/modifie.

Exemple:
`api/auth/credentials/route.ts`:
- role: endpoint login credentials,
- fonction: `POST`,
- appelee par: `AuthContext.loginWithCredentials`,
- effet: verifie credentials et renvoie token session.

---

## 10 bis) Format anti-flou (obligatoire pour chaque fichier)
Pour eviter les explications vagues, j'utilise toujours cette grille:

1. Ce que ca fait
2. Ce que ca ne fait pas
3. Entrees (body, params, headers)
4. Sorties (JSON, status HTTP, redirect)
5. Erreurs possibles

Exemple 1 - `src/app/(backend)/api/auth/credentials/route.ts`:
Ce que ca fait: verifie email/mot de passe et renvoie un JWT.
Ce que ca ne fait pas: n'envoie pas de magic link, ne cree pas de compte.
Entrees: `{ email, password }` en JSON.
Sorties: `200` avec `{ token, user }` ou erreur.
Erreurs: `400` donnees invalides, `403` role non autorise.

Exemple 2 - `src/app/(backend)/api/auth/magic-link/verify/route.ts`:
Ce que ca fait: valide le token magic link et ouvre une session.
Ce que ca ne fait pas: ne verifie pas un mot de passe.
Entrees: query param `token`.
Sorties: `200` avec token session + user.
Erreurs: `400` token manquant, `401` token invalide/expire, `404` user introuvable.

Exemple 3 - `middleware.ts`:
Ce que ca fait: bloque les routes API privees sans Bearer token valide.
Ce que ca ne fait pas: ne gere pas l'UI, ne modifie pas la DB.
Entrees: header `Authorization`.
Sorties: `NextResponse.next()` ou `401`.
Erreurs: token absent ou invalide.

---

## 11) Check final (incolable)
Je suis pret si je peux, sans notes:
1. dessiner le flux complet login etudiant.
2. dessiner le flux complet login admin.
3. expliquer `middleware.ts` en 30 secondes.
4. citer 10 fichiers critiques et leur role.
5. donner 1 limite actuelle + 1 amelioration concrete.

---

## 11 bis) Dictionnaire des fichiers (ce fichier fait quoi exactement)

`src/context/AuthContext.tsx`:
Ce fichier centralise l'etat de connexion cote front.
Il expose `loginWithEmail`, `loginWithCredentials`, `loginWithMagicLink`, `logout`.
Il stocke et relit `user` et `userRole` dans le localStorage.

`src/lib/controllers/authController.ts`:
Ce fichier contient la logique metier du login credentials.
Sa fonction principale `login()` verifie user + mot de passe (`bcrypt`) et genere un JWT.
Il renvoie l'utilisateur sans `passwordHash`.

`src/app/(backend)/api/auth/login/route.ts`:
Endpoint d'entree de login par email.
Si `password` est present, il delegue vers `/api/auth/credentials`.
Sinon, il gere le cas etudiant: genere magic link, le stocke en DB, puis envoie l'email.

`src/app/(backend)/api/auth/credentials/route.ts`:
Endpoint login email+mot de passe.
Il appelle `authController.login()` et filtre les roles autorises (admin/examiner).
Il renvoie `{ token, user }` ou erreur.

`src/app/(backend)/api/auth/magic-link/verify/route.ts`:
Endpoint qui valide un token magic link.
Il verifie signature JWT + correspondance token en base + expiration.
Il genere ensuite un token de session et invalide le magic link.

`middleware.ts`:
Protection transversale des routes API.
Les routes publiques (`/api/auth`, `/api/health`) passent.
Les autres routes API exigent un Bearer token valide.

`src/lib/mongoose.ts`:
Gestion de la connexion MongoDB.
Il ouvre ou reutilise une connexion cachee pour eviter les reconnections inutiles.

`src/lib/models/user.ts`:
Definition du schema Mongoose utilisateur.
Contient les champs auth (`email`, `passwordHash`, `role`, `magicLink`) et profil.

`src/lib/services/userService.ts`:
Logique metier de creation et lecture utilisateurs.
Fonctions principales: `createUser`, `getAllUsers`.

`src/app/(backend)/api/users/route.ts`:
Endpoint users global.
`GET`: liste des users.
`POST`: creation d'un user via `createUser`.

`src/app/(backend)/api/users/import/route.ts`:
Endpoint upload CSV.
Recupere le fichier via `formData`, appelle `processCSVImport`, renvoie un resume.

`src/lib/services/importService.ts`:
Logique metier de l'import CSV.
Valide format/colonnes, parse les lignes, ignore doublons, cree les users, renvoie `imported/errors/warnings`.

`src/services/hackathonService.ts`:
Service front (client HTTP) pour les hackathons.
Fonctions principales: `fetchHackathons`, `fetchHackathon`, `saveHackathon`, `deleteHackathon`.
Il appelle les routes API `/api/hackathons*` avec Axios.

---

## 12) Version Ultra Simple (ton format unique)
Format a utiliser partout:
1. Demande
2. Reflexion
3. Recherche/Action
4. Rendu

### A) Login admin/examinateur
Fichiers:
- `src/context/AuthContext.tsx`
- `src/app/(backend)/api/auth/credentials/route.ts`
- `src/lib/controllers/authController.ts`
- `src/lib/models/user.ts`

1. Demande:
Le front envoie `email + password` a `/api/auth/credentials` depuis `AuthContext.tsx`.
2. Reflexion:
La route appelle `login(...)` dans `authController.ts` pour appliquer les regles metier.
3. Recherche/Action:
`authController.ts` cherche l'utilisateur (`User.findOne`), compare le mot de passe (`bcrypt.compare`), cree un JWT (`jwt.sign`).
4. Rendu:
La route renvoie `{ token, user }` (200) ou une erreur (400/403).

### B) Login etudiant (magic link)
Fichiers:
- `src/context/AuthContext.tsx`
- `src/app/(backend)/api/auth/login/route.ts`
- `src/lib/models/user.ts`
- `src/lib/utils/email.ts`
- `src/app/(backend)/api/auth/magic-link/verify/route.ts`
- `src/app/(frontend)/magic-link/verify/page.tsx`

1. Demande:
Le front envoie juste `email` vers `/api/auth/login`.
2. Reflexion:
La route detecte que c'est un etudiant et prepare un magic link.
3. Recherche/Action:
Generation token JWT court, sauvegarde en DB dans `users.magicLink`, envoi mail avec `sendMagicLink`, puis verification du token sur `/api/auth/magic-link/verify`.
4. Rendu:
Apres verification, l'API renvoie un token de session + user, puis le front redirige vers `/dashboard/student`.

### C) Middleware securite API
Fichier:
- `middleware.ts`

1. Demande:
Une requete arrive sur `/api/...`.
2. Reflexion:
Le middleware decide si route publique ou privee.
3. Recherche/Action:
Si privee, il lit `Authorization` et verifie le JWT.
4. Rendu:
Soit il laisse passer, soit il bloque avec `401`.

### D) Creation utilisateur admin
Fichiers:
- `src/app/(backend)/api/users/route.ts`
- `src/lib/services/userService.ts`
- `src/lib/models/user.ts`

1. Demande:
Le front envoie les donnees formulaire vers `POST /api/users`.
2. Reflexion:
La route appelle `createUser(data)` pour appliquer les regles.
3. Recherche/Action:
Validation des champs, verification email unique, hash password, insertion MongoDB.
4. Rendu:
Retour user cree (`201`) ou erreur metier (`400/409`).

### E) Import CSV utilisateurs
Fichiers:
- `src/app/(backend)/api/users/import/route.ts`
- `src/lib/services/importService.ts`

1. Demande:
Le front envoie un fichier CSV a `POST /api/users/import`.
2. Reflexion:
Le service decide quelles lignes sont valides.
3. Recherche/Action:
Lecture CSV, validation colonnes, controle doublons, creation users.
4. Rendu:
Retour d'un resume `{ imported, errors, warnings }`.
