# Guide Étudiant - Plateforme IA Éducative

## Table des matières

1. [Introduction](#introduction)
2. [Connexion à la plateforme](#connexion-à-la-plateforme)
3. [Interface principale](#interface-principale)
4. [Fonctionnement des hackathons](#fonctionnement-des-hackathons)
5. [Créer et gérer vos conversations](#créer-et-gérer-vos-conversations)
6. [Utiliser les modèles d'IA](#utiliser-les-modèles-dia)
7. [Paramètres avancés](#paramètres-avancés)
8. [Gestion des tokens](#gestion-des-tokens)
9. [Soumettre votre version finale](#soumettre-votre-version-finale)
10. [Conseils et bonnes pratiques](#conseils-et-bonnes-pratiques)
11. [Dépannage](#dépannage)
12. [Support](#support)

---

## Introduction

Bienvenue sur la plateforme IA éducative ! Cette plateforme vous permet de participer à des hackathons en utilisant des modèles d'intelligence artificielle avancés pour résoudre des défis et réaliser des projets créatifs.

### Qu'est-ce qu'un hackathon sur cette plateforme ?

Un hackathon est un événement où vous devez utiliser l'IA pour accomplir des tâches spécifiques dans un temps limité. Vous disposez de quotas de prompts (questions) et de tokens (unités de calcul) pour interagir avec les modèles d'IA.

---

## Connexion à la plateforme

### Étapes de connexion

1. **Accès à la page de connexion**

   - Rendez-vous sur la page de connexion de la plateforme
   - Vous verrez un formulaire simple demandant votre adresse email

2. **Saisie de votre email**

   - Entrez l'adresse email fournie par votre établissement
   - Cliquez sur "Continuer"

3. **Authentification par lien magique**

   - Un lien de connexion sécurisé sera envoyé à votre email
   - Vérifiez votre boîte de réception (et vos spams)
   - Cliquez sur le lien pour vous connecter automatiquement

4. **Redirection vers votre tableau de bord**
   - Une fois connecté, vous serez redirigé vers votre tableau de bord étudiant

### Informations importantes

- **Pas de mot de passe requis** : La plateforme utilise un système de liens magiques sécurisés
- **Email institutionnel obligatoire** : Seuls les emails fournis par votre établissement fonctionnent
- **Lien temporaire** : Le lien de connexion expire après utilisation pour votre sécurité

---

## Interface principale

### Vue d'ensemble du tableau de bord

Votre tableau de bord étudiant se compose de plusieurs éléments :

#### 1. Barre supérieure

- **Sélecteur de hackathon** : Menu déroulant pour choisir le hackathon actif
- **Bouton de nouvelle conversation** : Pour démarrer une nouvelle session
- **Menu mobile** : Icône hamburger sur mobile pour accéder à la sidebar
- **Bouton de déconnexion** : Pour vous déconnecter en sécurité

#### 2. Barre latérale (sidebar)

- **Historique des conversations** : Liste de toutes vos conversations passées
- **Filtre par hackathon** : Seules les conversations du hackathon sélectionné apparaissent
- **Informations de conversation** :
  - Titre avec date et heure
  - Aperçu du premier message
  - Badge du modèle utilisé (OpenAI/Mistral)
  - Icône de validation si version finale soumise
  - Bouton de suppression

#### 3. Zone principale de conversation

- **Interface de chat** : Zone d'affichage des messages
- **Paramètres de conversation** : Configuration des modèles et paramètres
- **Zone de saisie** : Pour entrer vos prompts
- **Statistiques** : Informations sur l'utilisation des tokens

---

## Fonctionnement des hackathons

### Sélection d'un hackathon

1. **Hackathons disponibles**

   - Seuls les hackathons actifs ou en cours apparaissent
   - Le statut peut être "En cours", "Actif" ou "Test"

2. **Information sur les hackathons**

   - **Nom et description** : Objectifs du hackathon
   - **Dates** : Période de début et fin
   - **Quotas** : Limites de prompts et tokens alloués
   - **Tâches** : Liste des défis à accomplir

3. **Changement de hackathon**
   - Utilisez le menu déroulant en haut à gauche
   - Changer de hackathon réinitialise la vue des conversations
   - Vos conversations précédentes restent sauvegardées

### Quotas et limites

Chaque hackathon impose des limites :

- **Prompts par étudiant** : Nombre maximum de questions que vous pouvez poser
- **Tokens par étudiant** : Limite de calcul IA disponible
- **Suivi en temps réel** : Vos consommations sont affichées dans l'interface

---

## Créer et gérer vos conversations

### Démarrer une nouvelle conversation

1. **Méthodes pour créer une conversation**

   - Cliquez sur le bouton "+" dans la barre supérieure
   - Ou utilisez le bouton "Nouvelle conversation" dans la sidebar

2. **Sélection du hackathon**

   - Assurez-vous d'avoir sélectionné le bon hackathon avant de commencer
   - Une conversation est automatiquement liée au hackathon actif

3. **Titre automatique**
   - Chaque conversation reçoit un titre avec la date et l'heure de création
   - Format : "Conversation DD/MM/AAAA HH:MM:SS"

### Gérer vos conversations existantes

#### Navigation dans l'historique

- **Liste chronologique** : Conversations triées par date de création
- **Aperçu rapide** : Les 100 premiers caractères du premier message
- **Indicateurs visuels** :
  - 🤖 Icône IA pour les réponses
  - ✅ Icône de validation pour les versions finales
  - 🏷️ Badge coloré du modèle utilisé

#### Supprimer une conversation

1. Cliquez sur l'icône de corbeille (🗑️) à côté de la conversation
2. Confirmez la suppression dans la boîte de dialogue
3. **Attention** : Cette action est irréversible

#### Reprendre une conversation

- Cliquez simplement sur une conversation dans la sidebar
- Elle se charge automatiquement dans la zone principale
- Vous pouvez continuer où vous vous étiez arrêté

---

## Utiliser les modèles d'IA

### Modèles disponibles

#### OpenAI

- **Nom affiché** : OpenAI
- **Badge** : Vert foncé
- **Caractéristiques** : Excellent pour les tâches créatives et de raisonnement
- **Usage recommandé** : Rédaction, analyse, résolution de problèmes complexes

#### Mistral

- **Nom affiché** : Mistral
- **Badge** : Bleu foncé
- **Caractéristiques** : Modèle français, bon pour les tâches linguistiques
- **Usage recommandé** : Traduction, analyse de texte français, tâches spécialisées

### Types de prompts

#### One Shot

- **Définition** : Chaque question est indépendante
- **Usage** : Questions ponctuelles, tâches isolées
- **Avantage** : Consomme moins de tokens
- **Exemple** : "Écris un poème sur l'hiver"

#### Contextuel

- **Définition** : L'IA garde en mémoire la conversation précédente
- **Usage** : Conversations longues, itérations sur un même sujet
- **Avantage** : Continuité et cohérence
- **Exemple** : Série de questions sur un même projet

### Sélection du type de prompt

1. Dans la zone de configuration, choisissez le type via le menu déroulant
2. **One Shot** par défaut pour économiser les tokens
3. Passez en **Contextuel** si vous avez besoin de continuité

---

## Paramètres avancés

### Configuration des paramètres

#### Temperature (0.0 à 1.0)

- **Définition** : Contrôle la créativité des réponses
- **Valeur par défaut** : 0.7
- **Temperature basse (0.0-0.3)** :
  - Réponses plus prévisibles et factuelles
  - Idéal pour : Analyses, calculs, informations précises
- **Temperature élevée (0.7-1.0)** :
  - Réponses plus créatives et variées
  - Idéal pour : Créativité, brainstorming, storytelling

#### Max Tokens (128 à 2048)

- **Définition** : Longueur maximale de la réponse
- **Valeur par défaut** : 512 tokens
- **Estimation** : 1 token ≈ 0.75 mot en français
- **Conseils** :
  - 128-256 : Réponses courtes
  - 512 : Réponses moyennes (recommandé)
  - 1024+ : Réponses longues (consomme plus)

### Optimisation des paramètres

#### Pour des réponses factuelles

```
Modèle : OpenAI ou Mistral
Type : One Shot
Temperature : 0.2
Max Tokens : 256-512
```

#### Pour de la créativité

```
Modèle : OpenAI
Type : Contextuel
Temperature : 0.8
Max Tokens : 512-1024
```

#### Pour économiser les tokens

```
Type : One Shot
Temperature : 0.3
Max Tokens : 256
```

---

## Gestion des tokens

### Comprendre les tokens

#### Qu'est-ce qu'un token ?

- **Unité de mesure** : Les modèles IA comptent le texte en tokens
- **Équivalence approximative** : 1 token = 0.75 mot français
- **Consommation** : Vos prompts ET les réponses consomment des tokens

#### Calcul de la consommation

- **Prompt envoyé** : Compte dans votre quota
- **Réponse IA** : Compte également
- **Mode contextuel** : Tout l'historique est recompté à chaque nouveau prompt

### Suivi de votre consommation

#### Affichage en temps réel

- **Compteur principal** : En haut de la zone de conversation
- **Format** : "X / Y tokens utilisés"
- **Barre de progression** : Visuel de votre consommation

#### Détails par conversation

- **Tokens par message** : Affiché sous chaque échange
- **Total de la conversation** : Cumul visible dans les statistiques
- **Modèle utilisé** : Information sur le modèle réellement sollicité

### Stratégies d'économie

#### Optimiser vos prompts

1. **Soyez concis** : Évitez les répétitions inutiles
2. **Prompts directs** : Allez droit au but
3. **Évitez les exemples longs** : Dans vos instructions

#### Gérer les paramètres

1. **Max Tokens réduit** : Limitez la longueur des réponses
2. **Mode One Shot** : Évitez le contextuel si non nécessaire
3. **Temperature adaptée** : Basse température pour des réponses concises

#### Planifier vos questions

1. **Préparez vos prompts** : Réfléchissez avant d'envoyer
2. **Groupez les questions** : En une seule demande si possible
3. **Itérez intelligemment** : Affinez plutôt que de recommencer

---

## Soumettre votre version finale

### Processus de soumission

#### Étape 1 : Générer plusieurs réponses

1. Posez votre question à l'IA
2. Vous pouvez générer plusieurs réponses avec différents paramètres
3. Chaque paire prompt/réponse apparaît dans l'historique

#### Étape 2 : Sélectionner votre choix

1. **Case à cocher** : À côté de chaque réponse "Sélectionner comme version finale"
2. **Une seule sélection** : Vous ne pouvez choisir qu'une réponse à la fois
3. **Confirmation visuelle** : Un indicateur vert confirme votre sélection

#### Étape 3 : Validation définitive

1. **Bouton de soumission** : "Valider définitivement cette réponse"
2. **Animation** : Le bouton devient vert et clignote quand une réponse est sélectionnée
3. **Confirmation** : Dialogue de confirmation avant soumission

#### Étape 4 : Finalisation

1. **Sauvegarde** : Votre choix est enregistré de façon permanente
2. **Page de version finale** : Accès à une page dédiée avec votre soumission
3. **Icône de validation** : Apparaît dans la sidebar pour cette conversation

### Page de version finale

#### Contenu affiché

- **Titre de la conversation** : Nom de votre session
- **Date de soumission** : Horodatage précis
- **Prompt sélectionné** : Votre question finale
- **Réponse finale** : La réponse choisie
- **Statistiques** :
  - Modèle utilisé
  - Tokens consommés
  - Paramètres utilisés (temperature, max tokens)

#### Accès et partage

- **URL unique** : Chaque version finale a sa propre adresse
- **Accès permanent** : Disponible après la fin du hackathon
- **Navigation** : Bouton retour vers le tableau de bord

### Points importants

#### ⚠️ Attention

- **Choix définitif** : Une fois soumise, la version finale ne peut plus être modifiée
- **Une seule soumission** : Par conversation, vous ne pouvez soumettre qu'une version finale
- **Validation requise** : Vous devez explicitement valider votre choix

#### ✅ Bonnes pratiques

- **Relisez avant validation** : Vérifiez que la réponse correspond à vos attentes
- **Comparez les options** : Générez plusieurs réponses avant de choisir
- **Vérifiez les paramètres** : Assurez-vous d'utiliser la configuration optimale

---

## Conseils et bonnes pratiques

### Rédaction de prompts efficaces

#### Structure recommandée

```
[Contexte] : Brève description du contexte
[Tâche] : Ce que vous voulez que l'IA fasse
[Format] : Comment vous voulez la réponse
[Contraintes] : Limites ou spécifications
```

#### Exemple de bon prompt

```
Contexte : Je prépare une présentation sur l'énergie renouvelable
Tâche : Rédige une introduction accrocheure de 200 mots
Format : Paragraphe structuré avec statistiques
Contraintes : Ton professionnel, données récentes
```

#### Prompts à éviter

- ❌ "Dis-moi quelque chose sur l'énergie"
- ❌ "Aide-moi avec mon projet"
- ❌ "Fais mon devoir"

### Stratégies par type de tâche

#### Tâches créatives

- **Temperature élevée** (0.7-0.9)
- **Mode contextuel** pour l'itération
- **Prompts ouverts** encourageant la créativité
- **Plusieurs générations** pour comparer

#### Tâches analytiques

- **Temperature basse** (0.1-0.3)
- **Mode one shot** pour les questions ponctuelles
- **Prompts précis** avec critères clairs
- **Demandes de justification** des réponses

#### Tâches de recherche

- **Sources multiples** : Demandez des références
- **Vérification croisée** : Posez la même question différemment
- **Fact-checking** : Demandez à l'IA de vérifier ses propres réponses

### Gestion du temps

#### Planification

1. **Début de hackathon** : Explorez les tâches disponibles
2. **Phase d'expérimentation** : Testez différents modèles et paramètres
3. **Phase de production** : Concentrez-vous sur vos meilleures idées
4. **Phase de finalisation** : Sélectionnez et soumettez vos versions finales

#### Allocation des ressources

- **30% exploration** : Tests et découvertes
- **50% développement** : Travail sur vos solutions
- **20% finalisation** : Sélection et soumission

---

## Dépannage

### Problèmes de connexion

#### Lien magique non reçu

1. **Vérifiez vos spams** : Le mail peut être filtré
2. **Attendez 5 minutes** : Délai possible de réception
3. **Vérifiez l'orthographe** : De votre adresse email
4. **Contactez le support** : Si le problème persiste

#### Lien expiré

- **Nouvelle demande** : Retournez à la page de connexion
- **Entrez votre email** : Pour recevoir un nouveau lien
- **Cliquez rapidement** : Les liens ont une durée limitée

### Problèmes techniques

#### Conversation ne se charge pas

1. **Rafraîchissez la page** : F5 ou Ctrl+R
2. **Vérifiez votre connexion** : Internet stable requis
3. **Changez de navigateur** : Essayez Chrome, Firefox ou Safari
4. **Videz le cache** : Ctrl+Shift+R pour un rechargement complet

#### Erreur lors de l'envoi

1. **Vérifiez vos tokens** : Quota peut être atteint
2. **Réduisez la taille** : Prompt trop long possible
3. **Attendez un moment** : Serveur peut être surchargé
4. **Réessayez** : Problème temporaire fréquent

#### Interface lente

1. **Trop de conversations** : Supprimez les anciennes
2. **Fermeture d'onglets** : Libérez la mémoire
3. **Redémarrage du navigateur** : Solution simple
4. **Connexion internet** : Vérifiez la bande passante

### Problèmes de quota

#### Tokens épuisés

- **Message d'erreur** : "Quota de tokens atteint"
- **Solutions** :
  - Attendez le prochain hackathon
  - Optimisez vos prompts restants
  - Contactez l'organisateur si erreur

#### Prompts limités

- **Compteur visible** : Dans l'interface
- **Planification** : Économisez pour les tâches importantes
- **Efficacité** : Groupez plusieurs questions

### FAQ rapide

#### Q: Puis-je utiliser plusieurs onglets ?

R: Oui, mais évitez d'avoir plusieurs conversations actives simultanément pour éviter les conflits.

#### Q: Mes conversations sont-elles privées ?

R: Vos conversations sont visibles par vous et les organisateurs du hackathon pour évaluation.

#### Q: Puis-je utiliser des outils externes ?

R: Cela dépend des règles du hackathon. Consultez le règlement spécifique.

#### Q: Comment optimiser mes tokens ?

R: Utilisez le mode "one shot", réduisez max_tokens, et rédigez des prompts concis.

#### Q: Puis-je revenir sur une version finale ?

R: Non, les versions finales sont définitives une fois soumises.

#### Q: L'IA peut-elle faire des erreurs ?

R: Oui, toujours vérifiez et validez les réponses importantes.
