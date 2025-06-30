# Documentation Sécurité - Prompt Challenge

## 1. Vue d'ensemble sécuritaire

La plateforme **Prompt Challenge** implémente un système de sécurité multi-couches pour protéger les données utilisateurs et contrôler l'accès aux fonctionnalités selon les rôles. Cette documentation détaille l'ensemble des mesures de sécurité mises en place.

### Principes de sécurité appliqués

- **Authentification forte** : JWT + liens magiques
- **Autorisation granulaire** : Contrôle d'accès basé sur les rôles (RBAC)
- **Validation systématique** : Côté client et serveur
- **Chiffrement des données sensibles** : Mots de passe hashés
- **Protection des communications** : HTTPS recommandé
- **Audit et traçabilité** : Logs sécurisés

---

## 2. Architecture sécuritaire

### 2.1 Modèle de sécurité

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│ • AuthContext : Gestion état authentification          │
│ • ProtectedRoute : Protection composants               │
│ • Validation Zod : Validation côté client             │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Middleware (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│ • Vérification JWT sur /api/*                          │
│ • Exclusion routes publiques                           │
│ • Protection automatique API                           │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   API Routes (Backend)                  │
├─────────────────────────────────────────────────────────┤
│ • Validation Zod côté serveur                          │
│ • Contrôle d'accès par rôle                           │
│ • Hashage bcrypt                                       │
│ • Gestion erreurs sécurisée                           │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   MongoDB + Mongoose                    │
├─────────────────────────────────────────────────────────┤
│ • Contraintes d'unicité                                │
│ • Index sécurisés                                      │
│ • Validation schémas                                   │
│ • Sanitization automatique                             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Flux de sécurité

1. **Authentification** → Vérification identité
2. **Autorisation** → Contrôle permissions
3. **Validation** → Vérification données
4. **Chiffrement** → Protection stockage
5. **Audit** → Traçabilité actions

---

## 3. Authentification

### 3.1 Système d'authentification différenciée

#### 3.1.1 Étudiants : Liens magiques

**Principe** : Authentification sans mot de passe via email

**Flux sécurisé** :

```javascript
// 1. Demande de connexion
POST /api/auth/login
{
  "email": "etudiant@example.com"
}

// 2. Génération token JWT avec expiration courte
const token = jwt.sign(
  { email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "10m", algorithm: "HS256" }
);

// 3. Envoi email sécurisé via SendGrid
const magicLink = `${baseUrl}/magic-link/verify?token=${token}`;

// 4. Vérification et authentification
GET /api/auth/magic-link/verify?token=<JWT>
```

**Sécurité du processus** :

- **Expiration courte** : 10 minutes maximum
- **Token unique** : JWT non réutilisable
- **Validation email** : Format et existence vérifiés
- **HTTPS obligatoire** : Protection du lien
- **Nettoyage token** : Suppression après usage

#### 3.1.2 Examinateurs/Admins : Credentials

**Principe** : Authentification traditionnelle email/mot de passe

**Sécurité implémentée** :

```javascript
// Validation stricte côté serveur
const validCredentials =
  email === PREDEFINED_CREDENTIALS.examiner.email &&
  password === PREDEFINED_CREDENTIALS.examiner.password;

// Protection contre timing attacks
// (même temps de traitement succès/échec)
```

**Comptes prédéfinis sécurisés** :

- **Admin** : `admin@example.com` / `admin123`
- **Examinateur** : `pierre.durand@example.fr` / `examiner123`

> ⚠️ **Important** : Changer les mots de passe par défaut en production

### 3.2 JSON Web Tokens (JWT)

#### 3.2.1 Configuration sécurisée

```javascript
// Variables d'environnement obligatoires
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

// Génération token sécurisé
const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
  expiresIn: "10m", // Expiration courte
  algorithm: "HS256", // Algorithme sécurisé
  issuer: "prompt-challenge", // Identification émetteur
});
```

#### 3.2.2 Validation systématique

**Middleware de protection** :

```javascript
// middleware.ts - Protection automatique /api/*
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques exemptées
  const PUBLIC_PATHS = ["/api/auth", "/api/health"];

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Vérification JWT obligatoire
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}
```

### 3.3 Gestion des sessions

#### 3.3.1 Stockage sécurisé

```javascript
// AuthContext.tsx - Stockage local sécurisé
const setInStorage = (key: string, value: string): void => {
  if (!isClient) return; // Protection SSR
  localStorage.setItem(key, value);
};

// Vérification côté client uniquement
useEffect(() => {
  if (isClient) {
    const storedUser = getFromStorage("user");
    const storedRole = getFromStorage("userRole");

    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setUserRole(storedRole);
    }
  }
}, []);
```

#### 3.3.2 Déconnexion sécurisée

```javascript
const logout = () => {
  setUser(null);
  setUserRole(null);
  removeFromStorage("user");
  removeFromStorage("userRole");
  // Redirection automatique vers login
};
```

---

## 4. Autorisation et contrôle d'accès

### 4.1 Système de rôles (RBAC)

#### 4.1.1 Définition des rôles

```typescript
type UserRole = "student" | "examiner" | "admin" | "etudiant" | "examinateur";

// Support bi-langue pour compatibilité
const VALID_ROLES = {
  etudiant: ["etudiant", "etudiants", "student", "students"],
  examinateur: ["examinateur", "examinateurs", "examiner", "examiners"],
  admin: ["admin", "admins", "administrateur", "administrateurs"],
};
```

#### 4.1.2 Matrice des permissions

| Rôle            | Conversations                                                    | Évaluations                                                   | Utilisateurs    | Hackathons      | Config |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | --------------- | --------------- | ------ |
| **Étudiant**    | ✅ Créer/Lire ses conversations<br>✅ Soumettre versions finales | ❌                                                            | ❌              | ✅ Lire         | ❌     |
| **Examinateur** | ✅ Lire conversations finalisées<br>❌ Modifier/Supprimer        | ✅ Créer/Lire ses évaluations<br>❌ Modifier après soumission | ❌              | ✅ Lire         | ❌     |
| **Admin**       | ✅ CRUD complet                                                  | ✅ Lecture toutes évaluations                                 | ✅ CRUD complet | ✅ CRUD complet | ✅     |

### 4.2 Protection des routes

#### 4.2.1 Composant ProtectedRoute

```typescript
// ProtectedRoute.tsx - Protection granulaire
export const ProtectedRoute: React.FC<{
  allowedRoles: string[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!allowedRoles.includes(userRole ?? "")) {
        router.push("/unauthorized");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, userRole, allowedRoles]);

  // Rendu conditionnel sécurisé
  if (!isAuthenticated || !allowedRoles.includes(userRole ?? "")) {
    return null;
  }

  return <>{children}</>;
};
```

#### 4.2.2 Protection des pages

```typescript
// Exemple : Page examinateur
export default function ExaminerPage() {
  return (
    <ProtectedRoute allowedRoles={["examiner"]}>
      <ExaminerDashboard />
    </ProtectedRoute>
  );
}
```

### 4.3 Contrôle d'accès API

#### 4.3.1 Validation rôle côté serveur

```javascript
// Exemple : API évaluations - Contrôle strict
export async function POST(request: Request) {
  // 1. Vérification JWT (middleware automatique)
  // 2. Validation payload
  const data = await request.json();

  // 3. Vérification permissions métier
  const evaluation = evaluations.find(
    (e) =>
      e.conversationId === data.conversationId &&
      e.examinerId === data.examinerId
  );

  if (evaluation) {
    return NextResponse.json(
      { error: "Une évaluation existe déjà" },
      { status: 409 }
    );
  }

  // 4. Création sécurisée
  const newEvaluation = await createEvaluation(data);
  return NextResponse.json({ success: true, evaluation: newEvaluation });
}
```

---

## 5. Validation et sanitization

### 5.1 Validation côté client (Zod)

#### 5.1.1 Schémas de validation utilisateur

```typescript
// userValidation.ts - Validation stricte
export const userValidationSchema = z
  .object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z
      .string()
      .email("Format d'email invalide")
      .min(1, "L'email est requis"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .optional()
      .or(z.literal("")),
    role: z.enum([
      "student",
      "examiner",
      "admin",
      "etudiant",
      "examinateur",
      "",
    ]),
    dateNaissance: z
      .string()
      .optional()
      .refine((val) => !val || isValidDate(val), {
        message: "Format de date invalide (YYYY-MM-DD)",
      }),
    numeroEtudiant: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 8, {
        message: "Le numéro étudiant doit contenir au moins 8 caractères",
      }),
  })
  .strict() // Propriétés supplémentaires interdites
  .refine(
    (data) => {
      // Validation conditionnelle : mot de passe obligatoire pour admins/examinateurs
      if (
        (data.role === "examiner" || data.role === "admin") &&
        (!data.password || data.password.length < 6)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Un mot de passe de 6 caractères minimum est requis",
      path: ["password"],
    }
  );
```

#### 5.1.2 Validation en temps réel

```typescript
// Exemple : Formulaire utilisateur avec validation live
const UserForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(userValidationSchema),
    mode: "onChange", // Validation en temps réel
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register("email")}
        className={form.formState.errors.email ? "error" : ""}
      />
      {form.formState.errors.email && (
        <span className="error-message">
          {form.formState.errors.email.message}
        </span>
      )}
    </form>
  );
};
```

### 5.2 Validation côté serveur

#### 5.2.1 Double validation systématique

```javascript
// API route - Validation serveur obligatoire
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation Zod côté serveur (même schéma)
    const validatedData = userValidationSchema.parse(body);

    // Traitement sécurisé
    const user = await createUser(validatedData);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0]?.message || "Données invalides",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

#### 5.2.2 Sanitization automatique

```javascript
// Mongoose - Sanitization automatique
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Normalisation
    trim: true, // Suppression espaces
  },
  passwordHash: {
    type: String,
    required: true,
    select: false, // Exclusion par défaut des requêtes
  },
});
```

---

## 6. Chiffrement et protection des données

### 6.1 Hashage des mots de passe

#### 6.1.1 Bcrypt avec salt

```javascript
// userService.ts - Hashage sécurisé
import bcrypt from "bcryptjs";

export async function createUser(data: CreateUserData) {
  // Génération mot de passe par défaut pour étudiants
  const finalPassword = password || "magic_link_user_no_password_needed";

  // Hash avec salt automatique (coût 10)
  const passwordHash = await bcrypt.hash(finalPassword, 10);

  const newUser = await User.create({
    ...data,
    passwordHash, // Stockage uniquement du hash
    // Jamais de stockage en clair
  });

  return newUser;
}
```

#### 6.1.2 Vérification sécurisée

```javascript
// Authentification - Comparaison hash
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (error) {
    console.error("Erreur vérification mot de passe:", error);
    return false; // Échec sécurisé
  }
}
```

### 6.2 Protection des données sensibles

#### 6.2.1 Exclusion automatique

```javascript
// Modèle User - Protection passwordHash
const userSchema = new Schema({
  passwordHash: {
    type: String,
    required: true,
    select: false, // Exclusion automatique des requêtes
  },
});

// API /users/me - Nettoyage manuel
export async function GET(request: Request) {
  const user = await User.findById(payload.sub).lean();

  if (user) {
    // Suppression explicite des données sensibles
    delete user.passwordHash;
    delete user.magicLink;
  }

  return NextResponse.json({ user });
}
```

#### 6.2.2 Logs sécurisés

```javascript
// Exemple : Logging sans exposition de données
console.log("Connexion utilisateur:", {
  userId: user._id,
  email: user.email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Email masqué
  role: user.role,
  timestamp: new Date().toISOString(),
  // Jamais de mot de passe ou token en logs
});
```

---

## 7. Protection contre les attaques

### 7.1 Injection et XSS

#### 7.1.1 Prévention injection NoSQL

```javascript
// Mongoose - Protection automatique
const user = await User.findOne({
  email: sanitizedEmail, // Mongoose échappe automatiquement
});

// Validation stricte des ObjectId
if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: "ID invalide" }, { status: 400 });
}
```

#### 7.1.2 Échappement XSS

```tsx
// React - Échappement automatique
const UserDisplay = ({ user }) => (
  <div>
    {/* React échappe automatiquement les chaînes */}
    <h1>{user.nom}</h1>
    <p>{user.email}</p>

    {/* Éviter dangerouslySetInnerHTML */}
    {/* <div dangerouslySetInnerHTML={{ __html: userInput }} /> */}
  </div>
);
```

### 7.2 CSRF et session hijacking

#### 7.2.1 Protection CSRF

```javascript
// Next.js - Protection CSRF automatique
// Pour les formulaires, utiliser les actions serveur Next.js
export async function createUserAction(formData: FormData) {
  // Next.js gère automatiquement la protection CSRF
  // pour les server actions
}
```

#### 7.2.2 Sécurisation JWT

```javascript
// JWT sécurisé avec expiration courte
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: "10m", // Expiration courte
  algorithm: "HS256", // Algorithme sécurisé
  issuer: "prompt-challenge", // Identification émetteur
  audience: "students", // Audience spécifique
});

// Validation stricte
jwt.verify(token, JWT_SECRET, {
  algorithms: ["HS256"], // Algorithme fixe
  issuer: "prompt-challenge", // Vérification émetteur
  audience: "students", // Vérification audience
});
```

### 7.3 Rate limiting et bruteforce

#### 7.3.1 Limitation côté middleware

```javascript
// Protection contre le bruteforce (conceptuel)
const rateLimiter = new Map();

export function middleware(req: NextRequest) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (req.nextUrl.pathname.includes("/auth/login")) {
    const attempts = rateLimiter.get(ip) || [];
    const recentAttempts = attempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      );
    }

    rateLimiter.set(ip, [...recentAttempts, now]);
  }

  return NextResponse.next();
}
```

---

## 8. Sécurité des communications

### 8.1 Transport sécurisé

#### 8.1.1 HTTPS obligatoire

```javascript
// next.config.ts - Redirection HTTPS en production
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],
        destination: "https://yourdomain.com/:path*",
        permanent: true,
      },
    ];
  },
};
```

#### 8.1.2 Headers de sécurité

```javascript
// middleware.ts - Headers sécurisés
export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Protection XSS
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // HSTS (HTTPS strict)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // CSP basique
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );

  return response;
}
```

### 8.2 Sécurité email

#### 8.2.1 Validation et sanitization

```javascript
// email.ts - Validation stricte email
export const sendMagicLink = async (email: string, link: string) => {
  // Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Format d'email invalide");
  }

  // Validation URL
  if (!link.startsWith("http://") && !link.startsWith("https://")) {
    throw new Error("URL invalide");
  }

  // Configuration SendGrid sécurisée
  const msg = {
    to: email,
    from: {
      email: sendgridFromEmail,
      name: "Prompt Challenge",
    },
    subject: "Votre lien magique - Prompt Challenge",
    html: generateSecureEmailTemplate(link),
    // Protection tracking
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
    },
  };

  await sgMail.send(msg);
};
```

---

## 9. Audit et monitoring

### 9.1 Logging sécurisé

#### 9.1.1 Logs d'audit

```javascript
// Exemple : Logging d'audit des actions sensibles
const auditLog = (action: string, userId: string, details?: any) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      userId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      details: sanitizeForLogs(details), // Suppression données sensibles
    })
  );
};

// Usage
auditLog("USER_LOGIN", user._id, { role: user.role });
auditLog("EVALUATION_CREATED", examiner._id, { conversationId });
auditLog("USER_CREATED", admin._id, { newUserRole: newUser.role });
```

#### 9.1.2 Monitoring des erreurs

```javascript
// Gestion d'erreurs avec monitoring
export async function POST(request: Request) {
  try {
    // Logique métier
  } catch (error) {
    // Log erreur sans exposition
    console.error("API Error:", {
      endpoint: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      // Pas de stacktrace en production
    });

    // Réponse générique côté client
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
```

### 9.2 Health checks

#### 9.2.1 Endpoint de santé

```javascript
// /api/health - Monitoring de sécurité
export async function GET() {
  try {
    await connectDB();

    // Vérifications sécuritaires
    const securityChecks = {
      database: mongoose.connection.readyState === 1,
      jwtSecret: !!process.env.JWT_SECRET,
      sendgridConfig: !!(
        process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL
      ),
    };

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      security: securityChecks,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Service unavailable" },
      { status: 500 }
    );
  }
}
```

---

## 10. Configuration sécurisée

### 10.1 Variables d'environnement

#### 10.1.1 Variables requises

```bash
# .env.local - Configuration sécurisée requise

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXTAUTH_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# Email Service
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Security
NODE_ENV=production
```

#### 10.1.2 Validation configuration

```javascript
// Configuration startup validation
const requiredEnvVars = [
  "JWT_SECRET",
  "MONGODB_URI",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Variable d'environnement manquante: ${envVar}`);
  }
});

// Validation JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET doit contenir au moins 32 caractères");
}
```

### 10.2 Sécurité base de données

#### 10.2.1 Contraintes MongoDB

```javascript
// Modèles avec contraintes sécurisées
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Contrainte unicité
    index: true, // Index pour performance
    lowercase: true, // Normalisation
    trim: true, // Nettoyage
    validate: {
      // Validation custom
      validator: (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: "Format email invalide",
    },
  },
  role: {
    type: String,
    enum: ["student", "examiner", "admin"], // Valeurs autorisées uniquement
    default: "student",
  },
});

// Index composé pour évaluations
evaluationSchema.index(
  { examinerId: 1, conversationId: 1 },
  { unique: true } // Un examinateur = une évaluation par conversation
);
```

---

## 11. Bonnes pratiques de déploiement

### 11.1 Sécurité production

#### 11.1.1 Checklist pré-déploiement

- [ ] **Variables d'environnement** : Toutes définies et sécurisées
- [ ] **HTTPS** : Certificat SSL valide et redirection forcée
- [ ] **Mots de passe par défaut** : Tous changés
- [ ] **Logs sensibles** : Supprimés ou masqués
- [ ] **CSP** : Content Security Policy configurée
- [ ] **Rate limiting** : Protection bruteforce active
- [ ] **Monitoring** : Alertes sécurité configurées
- [ ] **Backup** : Stratégie de sauvegarde validée

#### 11.1.2 Configuration serveur

```nginx
# nginx.conf - Configuration sécurisée
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:3000;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 11.2 Maintenance sécuritaire

#### 11.2.1 Mise à jour régulière

```bash
# Script de mise à jour sécurisée
#!/bin/bash

echo "🔍 Vérification vulnérabilités..."
npm audit

echo "🔄 Mise à jour dépendances sécuritaires..."
npm update

echo "🧪 Tests sécurité..."
npm run test:security

echo "🚀 Déploiement sécurisé..."
npm run build && npm run deploy
```

#### 11.2.2 Monitoring continu

```javascript
// Alertes sécurité automatiques
const securityMonitor = {
  // Détection tentatives bruteforce
  detectBruteforce: (failedAttempts: number, timeWindow: number) => {
    if (failedAttempts > 10 && timeWindow < 300000) {
      // 5 min
      sendAlert("BRUTEFORCE_DETECTED", { failedAttempts, timeWindow });
    }
  },

  // Détection accès non autorisé
  detectUnauthorizedAccess: (endpoint: string, userRole: string) => {
    const authorizedRoles = getAuthorizedRoles(endpoint);
    if (!authorizedRoles.includes(userRole)) {
      sendAlert("UNAUTHORIZED_ACCESS", { endpoint, userRole });
    }
  },

  // Détection injection
  detectInjection: (input: string) => {
    const suspiciousPatterns = [
      /\$where/i,
      /\$ne/i,
      /<script>/i,
      /javascript:/i,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(input))) {
      sendAlert("INJECTION_ATTEMPT", { input: input.substring(0, 100) });
    }
  },
};
```

---

## 12. Gestion des incidents

### 12.1 Procédures d'urgence

#### 12.1.1 Réponse aux incidents

1. **Détection** : Monitoring automatique + alertes
2. **Isolation** : Blocage accès compromis
3. **Investigation** : Analyse logs et traces
4. **Containment** : Limitation propagation
5. **Éradication** : Suppression menace
6. **Récupération** : Restauration service
7. **Post-incident** : Analyse et amélioration

#### 12.1.2 Contacts d'urgence

```javascript
// Système d'alertes sécurité
const emergencyContacts = {
  security: "security@your-domain.com",
  admin: "admin@your-domain.com",
  technical: "tech@your-domain.com",
};

const sendSecurityAlert = async (type: string, details: any) => {
  const alert = {
    timestamp: new Date().toISOString(),
    severity: getSeverity(type),
    type,
    details,
    source: "prompt-challenge-security",
    environment: process.env.NODE_ENV,
  };

  // Envoi alerte immédiate pour incidents critiques
  if (alert.severity === "CRITICAL") {
    await Promise.all([
      sendEmail(emergencyContacts.security, alert),
      sendSMS(emergencyNumbers.oncall, alert),
      postToSlackChannel("#security-alerts", alert),
    ]);
  }
};
```

---

## 13. Conformité et réglementation

### 13.1 RGPD et protection des données

#### 13.1.1 Données personnelles collectées

| Type de donnée   | Finalité                   | Base légale       | Durée conservation         |
| ---------------- | -------------------------- | ----------------- | -------------------------- |
| Nom, prénom      | Identification utilisateur | Exécution contrat | Durée du hackathon + 1 an  |
| Email            | Authentification           | Exécution contrat | Durée du hackathon + 1 an  |
| Conversations IA | Évaluation pédagogique     | Intérêt légitime  | Durée du hackathon + 2 ans |
| Évaluations      | Notation académique        | Exécution contrat | Durée du hackathon + 5 ans |

#### 13.1.2 Droits des utilisateurs

```javascript
// API pour droits RGPD
export async function handleGDPRRequest(type: string, userId: string) {
  switch (type) {
    case "ACCESS":
      // Droit d'accès - export données
      return await exportUserData(userId);

    case "RECTIFICATION":
      // Droit de rectification
      return await updateUserData(userId, validatedData);

    case "ERASURE":
      // Droit à l'effacement
      return await deleteUserData(userId);

    case "PORTABILITY":
      // Droit à la portabilité
      return await exportUserDataStructured(userId);

    case "RESTRICTION":
      // Limitation du traitement
      return await restrictUserData(userId);
  }
}
```

### 13.2 Audit et compliance

#### 13.2.1 Trail d'audit

```javascript
// Audit trail complet
const auditTrail = {
  userActions: {
    login: "Connexion utilisateur",
    logout: "Déconnexion utilisateur",
    dataAccess: "Accès aux données",
    dataModification: "Modification données",
    dataExport: "Export données",
  },

  adminActions: {
    userCreation: "Création utilisateur",
    userDeletion: "Suppression utilisateur",
    roleChange: "Changement de rôle",
    configChange: "Modification configuration",
  },

  securityEvents: {
    loginFailure: "Échec authentification",
    unauthorizedAccess: "Tentative accès non autorisé",
    suspiciousActivity: "Activité suspecte",
    dataLeak: "Fuite de données potentielle",
  },
};
```

---

## 14. Formation et sensibilisation

### 14.1 Guide sécurité utilisateurs

#### 14.1.1 Mots de passe sécurisés

- **Longueur minimum** : 8 caractères (12+ recommandé)
- **Complexité** : Majuscules, minuscules, chiffres, symboles
- **Unicité** : Différent pour chaque service
- **Stockage** : Gestionnaire de mots de passe recommandé
- **Renouvellement** : En cas de compromission

#### 14.1.2 Détection phishing

**Signaux d'alerte** :

- URL suspecte (différente du domaine officiel)
- Demande urgente d'informations
- Fautes d'orthographe/grammaire
- Demande de mot de passe par email
- Liens raccourcis non identifiés

**Vérifications** :

- Vérifier l'URL du site (HTTPS + domaine correct)
- Confirmer par canal alternatif si doute
- Ne jamais cliquer sur liens suspects
- Signaler tentatives de phishing

### 14.2 Procédures sécurisées

#### 14.2.1 Pour les étudiants

1. **Utiliser uniquement les liens officiels** de connexion
2. **Vérifier l'URL** avant de saisir des informations
3. **Se déconnecter** après chaque session
4. **Signaler** toute activité suspecte immédiatement
5. **Ne pas partager** son lien magique avec autrui

#### 14.2.2 Pour les examinateurs/admins

1. **Changer le mot de passe par défaut** immédiatement
2. **Utiliser un mot de passe fort** et unique
3. **Activer la double authentification** si disponible
4. **Contrôler régulièrement** les accès et permissions
5. **Respecter le principe** du moindre privilège
