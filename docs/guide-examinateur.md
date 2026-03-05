# Guide Examinateur - Prompt Challenge

## 1. Introduction

### Qu'est-ce qu'un examinateur ?

En tant qu'**examinateur**, vous jouez un rôle crucial dans la plateforme Prompt Challenge. Votre mission consiste à :

- **Évaluer** les conversations finales soumises par les étudiants
- **Noter** les performances selon des critères pédagogiques
- **Fournir des commentaires** constructifs pour l'apprentissage
- **Suivre la progression** des évaluations dans différents hackathons

### Prérequis

- Compte examinateur activé par un administrateur
- Email et mot de passe fournis par l'équipe pédagogique
- Accès à un navigateur web moderne
- Connexion internet stable

---

## 2. Connexion à la plateforme

### Processus de connexion

1. **Accédez** à la page de connexion de Prompt Challenge
2. **Sélectionnez** "Connexion examinateur" (onglet dédié)
3. **Saisissez** votre email et mot de passe :
   - Email exemple : `examinateur@votre-etablissement.fr`
   - Mot de passe fourni par l'administration
4. **Cliquez** sur "Se connecter"

### Dépannage connexion

| Problème            | Solution                                          |
| ------------------- | ------------------------------------------------- |
| Mot de passe oublié | Contactez un administrateur pour réinitialisation |
| Compte bloqué       | Vérifiez avec l'équipe administrative             |
| Email non reconnu   | Assurez-vous d'utiliser l'email exact fourni      |

---

## 3. Interface du tableau de bord

### Vue d'ensemble

L'interface examinateur se compose de plusieurs zones principales :

```
┌─────────────────┬──────────────────────────────────────┐
│                 │  Header (Filtres + Navigation)       │
│   Sidebar       ├──────────────────────────────────────┤
│                 │                                      │
│ • À évaluer     │        Zone principale               │
│ • Mes évals     │     (Évaluation/Révision)            │
│                 │                                      │
└─────────────────┴──────────────────────────────────────┘
```

### Header et navigation

- **Titre** : "Tableau de bord examinateur"
- **Filtres** : Sélection hackathon et tâche
- **Navigation** : Bouton retour accueil
- **Profil** : Badge "Examinateur" + bouton déconnexion

### Sidebar responsive

#### Mobile

- **Menu hamburger** en haut à gauche
- **Ouverture/fermeture** tactile de la sidebar

#### Desktop

- **Sidebar fixe** toujours visible
- **Largeur** : 256px (16rem)

---

## 4. Évaluation des conversations

### Section "À évaluer"

La sidebar affiche les conversations nécessitant une évaluation :

#### Informations affichées

- **Numéro** : "Conversation #1, #2..."
- **Date** : Date de création de la conversation
- **État** : Indicateur visuel (point orange)
- **Compteur** : Nombre total de conversations en attente

#### Sélection d'une conversation

1. **Cliquez** sur une conversation dans la liste
2. L'interface principale **affiche** le contenu à évaluer
3. La conversation se **surligne** en orange/amber

### Interface d'évaluation

#### Contenu affiché

**Prompt final**

- Zone **indigo/purple** avec le prompt complet
- **Lecture** du prompt soumis par l'étudiant
- **Formatage** préservant les retours à la ligne

**Réponse IA finale**

- Zone **grise** avec la réponse générée
- **Affichage** de la réponse complète de l'IA
- **Préservation** du formatage original

#### Formulaire d'évaluation

**1. Système de notation**

```
Note : [Slider 1-10] 5/10

1 ──────●──────────────── 10
Très faible    Moyen    Excellent
```

- **Slider visuel** avec gradient rouge → jaune → vert
- **Affichage temps réel** de la note sélectionnée
- **Indicateur coloré** selon la note :
  - 🔴 Rouge (1-5) : "bg-red-100 text-red-800"
  - 🟡 Jaune (6-7) : "bg-yellow-100 text-yellow-800"
  - 🟢 Vert (8-10) : "bg-green-100 text-green-800"

**2. Commentaire détaillé**

```
Commentaire détaillé *
┌─────────────────────────────────────────────┐
│ Expliquez votre évaluation : points forts, │
│ points faibles, suggestions d'amélioration..│
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
                                    X caractères
```

- **Obligatoire** (marqué avec \*)
- **Textarea** redimensionnable (5 lignes minimum)
- **Compteur** de caractères en temps réel
- **Placeholder** avec suggestions d'évaluation

**3. Aide à l'évaluation**

Une zone d'aide apparaît sous le commentaire :

> 💡 **Suggestions** : Évaluez la clarté du prompt, la pertinence de la réponse, la créativité, la précision technique, et l'utilité pratique.

**4. Actions disponibles**

```
[  Soumettre l'évaluation  ] [  Réinitialiser  ]
```

- **Soumettre** : Valide et enregistre l'évaluation
- **Réinitialiser** : Remet la note à 5 et vide le commentaire
- **État de soumission** : Spinner pendant l'envoi

### Validation et contraintes

#### Validation côté client

- **Note obligatoire** : Entre 1 et 10
- **Commentaire obligatoire** : Non vide après trim()
- **Bouton désactivé** si commentaire vide

#### Validation côté serveur

- **Contrainte unique** : Un examinateur ne peut évaluer qu'une fois la même conversation
- **Erreur 409** si tentative de double évaluation
- **Validation Mongoose** sur le modèle de données

### Après soumission

#### Succès

- **Message toast** : "Évaluation soumise avec succès"
- **Rechargement** automatique de la liste des évaluations
- **Suppression** du formulaire d'évaluation
- **Badge vert** : "Évaluation terminée"

#### Erreurs courantes

- **Déjà évaluée** : "Vous avez déjà noté cette conversation"
- **Champs manquants** : "Le commentaire est obligatoire"
- **Erreur serveur** : Message d'erreur spécifique

---

## 5. Filtrage et organisation

### Filtres disponibles

#### Filtre hackathon

```
Hackathon : [🌟 Tous les hackathons ▼] [Effacer]
```

- **Sélection** parmi tous les hackathons disponibles
- **Affichage** : Nom + statut (ex: "Hackathon IA (En cours)")
- **Option par défaut** : "🌟 Tous les hackathons"
- **Bouton effacer** pour réinitialiser

#### Filtre tâche (conditionnel)

```
Tâche : [📋 Toutes les tâches ▼] [Effacer]
```

- **Visible** uniquement si un hackathon spécifique est sélectionné
- **Chargement dynamique** des tâches du hackathon choisi
- **Option par défaut** : "📋 Toutes les tâches"

### Indicateur de filtrage actif

Quand des filtres sont appliqués, un bandeau apparaît :

```
🧠 Filtrage actif : Hackathon IA → ⭐ Tâche ChatBot [Effacer tout]
```

- **Affichage** du hackathon et de la tâche sélectionnés
- **Bouton** "Effacer tout" pour réinitialiser tous les filtres
- **Couleurs** : Indigo pour hackathon, émeraude pour tâche

### Impact des filtres

#### Sur les conversations

- **Filtrage automatique** des conversations affichées
- **Rechargement** des données à chaque changement de filtre
- **Compteurs** mis à jour dans les statistiques

#### Sur les évaluations

- **Filtrage** des évaluations existantes
- **Synchronisation** avec les filtres de conversation
- **API** : Paramètres `hackathonId` et `tacheId`

---

## 6. Révision des évaluations

### Section "Mes évaluations"

#### Liste des évaluations terminées

- **Badge coloré** avec la note (vert/jaune/rouge)
- **Numéro** d'évaluation : "Éval #1, #2..."
- **Date et heure** : Format français complet
- **Extrait** du commentaire (2 lignes max)
- **Icône étoile** pour identifier les évaluations

#### Interaction

1. **Cliquez** sur une évaluation pour la réviser
2. L'évaluation se **surligne** en vert émeraude
3. L'interface principale **bascule** en mode révision

### Mode révision

#### En-tête spécial

```
⭐ Révision d'évaluation terminée    [Retour au tableau de bord]
```

#### Affichage de l'évaluation

**Zone évaluation (vert émeraude)**

```
┌─────────────────────────────────────────────────────────┐
│ Votre évaluation                            [8/10]      │
│                          Évaluée le 15/12/2024 14:30   │
├─────────────────────────────────────────────────────────┤
│ Votre commentaire :                                     │
│ "Excellent travail sur la clarté du prompt..."         │
└─────────────────────────────────────────────────────────┘
```

#### Contenu de la conversation

- **Prompt final** : Même affichage qu'en mode évaluation
- **Réponse IA finale** : Même affichage qu'en mode évaluation

#### Note d'information

```
⭐ Mode révision
Cette évaluation a déjà été soumise et ne peut plus être
modifiée. Vous pouvez uniquement consulter votre évaluation
précédente.
```

### Navigation entre modes

#### Désélection

- **Bouton** "Retour au tableau de bord"
- **Clic** sur une conversation à évaluer
- **Changement** de filtres

#### États exclusifs

- **Mode évaluation** : `selectedConversation` défini
- **Mode révision** : `selectedEvaluation` défini
- **Mode tableau de bord** : Aucune sélection

---

## 7. Statistiques et progression

### Tableau de bord principal

Quand aucune conversation n'est sélectionnée, l'interface affiche :

#### Titre dynamique

```
🌟 Tableau de bord des évaluations [Hackathon IA] [Tâche filtrée]
```

#### Cartes statistiques

**1. Conversations disponibles**

```
┌─────────────────────┐
│        ⭐          │
│        12          │
│ Conversations       │
│ disponibles         │
│ (filtres actifs)    │
└─────────────────────┘
```

**2. Évaluations terminées**

```
┌─────────────────────┐
│        ⭐          │
│         8          │
│ Évaluations         │
│ terminées           │
│ (filtres actifs)    │
└─────────────────────┘
```

**3. Restant à évaluer**

```
┌─────────────────────┐
│        ⭐          │
│         4          │
│ Restant à           │
│ évaluer             │
│ (filtres actifs)    │
└─────────────────────┘
```

#### Barre de progression

```
Progression des évaluations                    67%
████████████████████████████████░░░░░░░░░░░░
```

- **Calcul** : (évaluations terminées / total conversations) × 100
- **Gradient** vert émeraude
- **Animation** fluide lors des changements
- **Pourcentage** affiché à droite

### Indicateurs dans la sidebar

#### Section "À évaluer"

```
⭐ À évaluer
4 conversation(s)
```

#### Section "Mes évaluations"

```
⭐ Mes évaluations
8 évaluation(s) terminée(s) • Cliquez pour réviser
```

---

## 8. Bonnes pratiques d'évaluation

### Critères d'évaluation recommandés

#### 1. Clarté du prompt (30%)

- **Structure** logique et cohérente
- **Instructions** précises et non ambiguës
- **Contexte** suffisant pour la tâche
- **Orthographe** et grammaire correctes

#### 2. Pertinence de la réponse (25%)

- **Adéquation** réponse/demande
- **Complétude** par rapport aux attentes
- **Précision** factuelle des informations
- **Utilité** pratique du résultat

#### 3. Créativité et originalité (20%)

- **Approche** innovante du problème
- **Utilisation** créative de l'IA
- **Originalité** des techniques employées
- **Pensée** hors des sentiers battus

#### 4. Technique et méthodologie (15%)

- **Maîtrise** des paramètres IA
- **Optimisation** des résultats
- **Compréhension** des limitations
- **Iteration** et amélioration

#### 5. Présentation et communication (10%)

- **Formatage** professionnel
- **Lisibilité** du contenu
- **Organisation** des informations
- **Respect** des consignes

### Échelle de notation

| Note | Niveau           | Description                                      |
| ---- | ---------------- | ------------------------------------------------ |
| 9-10 | **Excellent**    | Travail exceptionnel dépassant les attentes      |
| 7-8  | **Bien**         | Travail solide répondant aux critères            |
| 5-6  | **Satisfaisant** | Travail correct avec des améliorations possibles |
| 3-4  | **Insuffisant**  | Travail incomplet ou problématique               |
| 1-2  | **Très faible**  | Travail très insuffisant ou non conforme         |

### Rédaction de commentaires constructifs

#### Structure recommandée

1. **Points forts** : Ce qui fonctionne bien
2. **Points d'amélioration** : Aspects à corriger
3. **Suggestions** : Conseils pour progresser
4. **Encouragements** : Motivation pour la suite

#### Exemples de commentaires

**Évaluation positive (8/10)**

```
Excellent travail ! Votre prompt est très bien structuré et
les instructions sont claires. La réponse IA obtenue est
pertinente et utile.

Points forts : Clarté des consignes, contexte bien défini,
résultat exploitable.

Suggestion d'amélioration : Pourriez explorer des paramètres
de température plus élevés pour plus de créativité.

Continuez sur cette voie !
```

**Évaluation critique constructive (4/10)**

```
Votre travail montre une compréhension de base mais nécessite
des améliorations importantes.

Points à revoir : Le prompt manque de précision dans les
instructions, le contexte est insuffisant, la réponse IA
n'est que partiellement exploitable.

Suggestions : Détaillez davantage vos attentes, ajoutez des
exemples concrets, testez plusieurs itérations.

Bon courage pour la suite !
```

### Gestion du temps

#### Planning recommandé

- **5-10 minutes** : Lecture attentive du prompt et de la réponse
- **5 minutes** : Réflexion sur les critères d'évaluation
- **5-10 minutes** : Rédaction du commentaire détaillé
- **2 minutes** : Relecture et finalisation

#### Productivité

- **Évaluez** 6-8 conversations par heure maximum
- **Prenez des pauses** toutes les 10 évaluations
- **Alternez** entre évaluations et révisions

---

## 9. Dépannage

### Problèmes de chargement

#### Conversations ne s'affichent pas

1. **Vérifiez** les filtres hackathon/tâche
2. **Actualisez** la page (F5)
3. **Changez** de hackathon puis revenez à "Tous"

#### Évaluations manquantes

1. **Contrôlez** les filtres appliqués
2. **Vérifiez** votre connexion internet
3. **Reconnectez-vous** si nécessaire

### Problèmes de soumission

#### Erreur "Déjà évaluée"

- **Cause** : Tentative de double évaluation
- **Solution** : Rafraîchissez pour voir l'évaluation existante

#### Erreur de validation

- **Cause** : Commentaire vide ou note invalide
- **Solution** : Vérifiez que tous les champs sont remplis

#### Erreur serveur 500

- **Cause** : Problème technique temporaire
- **Solution** : Attendez quelques minutes et réessayez

### Interface non responsive

#### Sur mobile

- **Menu hamburger** ne fonctionne pas : Rechargez la page
- **Sidebar bloquée** : Tapez en dehors pour fermer

#### Sur desktop

- **Sidebar trop étroite** : Zoomez/dézoomez (Ctrl +/-)
- **Affichage coupé** : Utilisez la barre de défilement

---

## 10. Support et assistance

### FAQ Examinateur

#### Q: Puis-je modifier une évaluation après soumission ?

**R:** Non, les évaluations sont définitives. Vous pouvez uniquement les consulter en mode révision.

#### Q: Que faire si une conversation semble incomplète ?

**R:** Contactez un administrateur pour vérification. N'évaluez pas une conversation manifestement incomplète.

#### Q: Comment bien noter une réponse IA médiocre ?

**R:** Évaluez la qualité du prompt et la pertinence de l'usage IA, pas uniquement la réponse générée.

#### Q: Y a-t-il un quota d'évaluations à respecter ?

**R:** Non, évaluez à votre rythme en privilégiant la qualité sur la quantité.

#### Q: Puis-je voir les évaluations d'autres examinateurs ?

**R:** Non, chaque examinateur ne voit que ses propres évaluations pour garantir l'indépendance.

#### Q: Que faire en cas de contenu inapproprié ?

**R:** Ne notez pas et contactez immédiatement un administrateur avec l'ID de la conversation.

### Ressources additionnelles

#### Documentation technique

- Guide administrateur complet
- Guide étudiant pour comprendre leur perspective
- Documentation API pour intégrations
