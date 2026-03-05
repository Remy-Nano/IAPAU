# Guide Administrateur - Plateforme IA Éducative

## Table des matières

1. [Introduction](#introduction)
2. [Connexion administrateur](#connexion-administrateur)
3. [Interface d'administration](#interface-dadministration)
4. [Gestion des utilisateurs](#gestion-des-utilisateurs)
5. [Gestion des hackathons](#gestion-des-hackathons)
6. [Import en masse](#import-en-masse)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Dépannage](#dépannage)

---

## Introduction

Bienvenue dans le guide administrateur de la plateforme IA éducative. Ce manuel vous accompagne dans la gestion complète de la plateforme : utilisateurs, hackathons et surveillance.

### Rôle de l'administrateur

En tant qu'administrateur, vous avez accès à toutes les fonctionnalités de gestion :

- **Gestion complète des utilisateurs** : Création, modification, suppression d'étudiants, examinateurs et autres admins
- **Administration des hackathons** : Configuration, surveillance et gestion des événements
- **Import en masse** : Ajout rapide d'utilisateurs via fichiers CSV
- **Surveillance des activités** : Monitoring des conversations et évaluations

### Prérequis

- Compte administrateur avec email et mot de passe
- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Connexion internet stable

---

## Connexion administrateur

### Processus d'authentification

1. **Accès à la page de connexion**

   - Rendez-vous sur la page de connexion de la plateforme
   - Entrez votre adresse email administrative

2. **Identification automatique**

   - Le système détecte votre rôle d'administrateur
   - Redirection vers le formulaire admin

3. **Authentification sécurisée**

   - **Email** : votre adresse administrateur
   - **Mot de passe** : Votre mot de passe sécurisé
   - Cliquez sur "Se connecter"

4. **Accès au tableau de bord**
   - Redirection automatique vers `/dashboard/admin`
   - Interface complète d'administration

### Sécurité

- **Mot de passe obligatoire** : Minimum 6 caractères
- **Sessions sécurisées** : Timeout automatique
- **Audit complet** : Toutes les actions sont tracées

---

## Interface d'administration

### Vue d'ensemble du tableau de bord

L'interface administrateur comporte trois zones principales :

#### 1. Barre latérale de navigation

- **Logo "AI studio"** : Identité de la plateforme
- **Gestion des utilisateurs** 👥 : Administration complète des comptes
- **Gestion des Hackathons** 💻 : Configuration des événements
- **Menu responsive** : Icône hamburger sur mobile

#### 2. En-tête

- **Titre de section** : Nom de la zone active
- **Badge "Administrateur"** : Confirmation du rôle
- **Bouton de déconnexion** : Sortie sécurisée

#### 3. Zone de contenu

- **Tableaux de données** : Listes paginées et filtrables
- **Formulaires** : Création et édition d'entités
- **Actions groupées** : Opérations en masse

### Navigation responsive

- **Desktop** : Sidebar permanente
- **Mobile** : Menu hamburger (☰) pour accéder aux sections
- **Tablette** : Interface adaptative selon l'orientation

---

## Gestion des utilisateurs

### Interface principale

#### Accès

1. Cliquez sur **"Gestion des utilisateurs"** dans la sidebar
2. Tableau principal avec liste complète des utilisateurs
3. Outils de recherche et filtrage disponibles

#### Barre d'outils

- **Recherche** : Champ de recherche par nom, prénom ou email
- **"Importer CSV"** 📤 : Import en masse d'utilisateurs
- **"Créer un utilisateur"** ➕ : Ajout manuel

#### Filtres par rôle

Onglets de navigation rapide :

- **Étudiants** : Filtre les comptes "student"/"etudiant"
- **Examinateurs** : Filtre les comptes "examiner"/"examinateur"
- **Administrateurs** : Filtre les comptes "admin"
- **Autres** : Comptes avec rôles non standard

#### Tableau des utilisateurs

**Colonnes :**

- **Nom** : Nom de famille
- **Prénom** : Prénom
- **Email** : Adresse de connexion
- **Rôle** : Badge coloré du rôle attribué
- **Actions** : Boutons d'édition ✏️ et suppression 🗑️

### Création d'utilisateurs

#### Ouverture du formulaire

- Cliquez sur "Créer un utilisateur"
- Modal de création qui s'affiche

#### Champs obligatoires

- **Prénom** : Minimum 2 caractères
- **Nom** : Minimum 2 caractères
- **Email** : Format valide et unique
- **Rôle** : Sélection dans liste déroulante

#### Champs conditionnels

**Pour étudiants :**

- **Mot de passe** : Pas requis (lien magique)
- **Numéro étudiant** : Optionnel (minimum 8 caractères)
- **Message informatif** : "Les étudiants utilisent un lien magique"

**Pour examinateurs/admins :**

- **Mot de passe** : Obligatoire (minimum 6 caractères)
- **Authentification** : Email/password classique

#### Champs optionnels

- **Date de naissance** : Format YYYY-MM-DD
- **Numéro étudiant** : Pour les étudiants uniquement

#### Validation et sauvegarde

1. **Validation temps réel** : Erreurs affichées immédiatement
2. **Vérification d'unicité** : Email déjà existant détecté
3. **Sauvegarde** : Clic sur "Créer l'utilisateur"
4. **Confirmation** : Toast "Utilisateur créé avec succès"

### Modification d'utilisateurs

#### Processus d'édition

1. **Sélection** : Clic sur l'icône ✏️ dans le tableau
2. **Modal d'édition** : Formulaire pré-rempli avec données actuelles
3. **Modification** : Tous les champs sont éditables
4. **Mot de passe** : Laissez vide pour conserver l'ancien
5. **Sauvegarde** : Bouton "Sauvegarder"

#### Cas particuliers

- **Changement de rôle** : Impact sur les permissions
- **Modification d'email** : Vérification d'unicité
- **Conservation de mot de passe** : Si champ laissé vide

### Suppression d'utilisateurs

#### Processus de suppression

1. **Sélection** : Clic sur l'icône 🗑️
2. **Confirmation** : "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
3. **Validation** : Boutons [Annuler] [Confirmer]
4. **Suppression** : Action immédiate et définitive

#### ⚠️ Avertissements critiques

- **Action irréversible** : Impossible d'annuler
- **Données associées** : Conversations et évaluations supprimées
- **Sauvegarde recommandée** : Export préalable conseillé

---

## Gestion des hackathons

### Interface de gestion

#### Accès

1. Cliquez sur **"Gestion des Hackathons"** dans la sidebar
2. Interface dédiée avec sélecteur et formulaire
3. Gestion complète du cycle de vie des événements

#### Zone de sélection

- **Menu déroulant** : Liste de tous les hackathons existants
- **"Nouveau hackathon"** : Création d'un événement vierge
- **Chargement automatique** : Affichage du hackathon sélectionné

### Création d'un hackathon

#### Informations générales

**Nom du hackathon :**

- Titre public affiché aux participants
- Champ obligatoire pour l'identification

**Description :**

- Présentation détaillée de l'événement
- Contexte et objectifs pédagogiques
- Visible par tous les participants

**Objectifs :**

- Compétences à développer
- Critères d'évaluation
- Attendus pédagogiques spécifiques

#### Configuration temporelle

**Dates :**

- **Date de début** : Format YYYY-MM-DD (ouverture aux étudiants)
- **Date de fin** : Format YYYY-MM-DD (fermeture automatique)
- **Validation** : Vérification de cohérence (fin > début)

#### Paramètres fonctionnels

**Anonymat :**

- **Case à cocher** : "Anonymat activé"
- **Usage** : Masquage des identités dans les évaluations
- **Recommandation** : Activé pour évaluations objectives

**Quotas par étudiant :**

- **Prompts par étudiant** : Nombre max de questions IA
- **Tokens par étudiant** : Limite de calcul IA
- **Gestion des ressources** : Contrôle des coûts d'usage

#### Gestion des tâches

**Ajout de tâches :**

1. Cliquez sur le bouton "+"
2. Champ de saisie pour description
3. Ajout dynamique à la liste

**Modification de tâches :**

- **Édition en ligne** : Clic direct sur le texte
- **Suppression** : Bouton "-" à côté de chaque tâche
- **Réorganisation** : Ordre modifiable

#### Statut du hackathon

**Options disponibles :**

- **"En cours"** : Hackathon actif accessible aux étudiants
- **"Test"** : Mode test pour validation avant publication
- **"Terminé"** : Événement clos, consultation seule
- **"Brouillon"** : En préparation, non visible

### Sauvegarde et gestion

#### Processus de sauvegarde

1. **Validation automatique** : Vérification des champs obligatoires
2. **Contrôle de cohérence** : Validation des dates et quotas
3. **Bouton "Enregistrer"** : Lancement de la sauvegarde
4. **Confirmation** : Toast de succès avec highlighting visuel

#### Mise à jour d'événements existants

1. **Sélection** : Choisir un hackathon dans le menu déroulant
2. **Modification** : Éditer les champs nécessaires
3. **Sauvegarde** : Même processus que la création
4. **Propagation immédiate** : Mise à jour pour tous les utilisateurs

#### Suppression d'hackathons

1. **Bouton "Supprimer"** : En bas du formulaire
2. **Confirmation obligatoire** : Dialogue d'avertissement
3. **Impact** : Suppression de toutes les données associées
4. **Action définitive** : Impossible d'annuler

---

## Import en masse

### Préparation du fichier CSV

#### Format requis

```csv
nom,prenom,email,role,dateNaissance,numeroEtudiant
Dupont,Jean,jean.dupont@univ.fr,student,1995-03-15,20241234
Martin,Sophie,sophie.martin@univ.fr,student,1996-07-22,20241235
Durand,Pierre,pierre.durand@univ.fr,examiner,1980-11-03,
```

#### Règles de formatage

- **En-tête obligatoire** : Première ligne avec noms des colonnes
- **Séparateur** : Virgule (,) uniquement
- **Encodage** : UTF-8 recommandé
- **Colonnes obligatoires** : nom, prenom, email
- **Colonnes optionnelles** : role, dateNaissance, numeroEtudiant

#### Spécificités par rôle

**Étudiants :**

- `numeroEtudiant` recommandé
- `role` : "student" ou "etudiant"

**Examinateurs/Admins :**

- `numeroEtudiant` non utilisé
- `role` : "examiner"/"examinateur" ou "admin"

### Processus d'import

#### Méthode 1 : Via modal

1. Dans "Gestion des utilisateurs"
2. Cliquez "Importer CSV"
3. Modal d'import simple

#### Méthode 2 : Page dédiée

1. Navigation vers `/admin/users/import`
2. Interface complète avec aperçu
3. Gestion avancée des erreurs

#### Étapes détaillées

**1. Téléchargement du modèle**

- Bouton "Télécharger le modèle CSV"
- Fichier pré-formaté à `/templates/template.csv`

**2. Sélection du fichier**

- Zone drag & drop
- Formats acceptés : .csv uniquement
- Taille max : 10MB

**3. Aperçu automatique**

- Lecture immédiate du fichier
- Tableau des 5 premières lignes
- Validation du format

**4. Import et traitement**

- Bouton "Importer"
- Traitement ligne par ligne
- Gestion des erreurs en temps réel

**5. Rapport final**

- Nombre d'utilisateurs créés/mis à jour
- Liste détaillée des erreurs
- Actions de correction possibles

### Gestion des erreurs

#### Types d'erreurs communes

- **Email déjà existant** : Conflit avec compte existant
- **Format email invalide** : Syntaxe incorrecte
- **Champs manquants** : Données obligatoires absentes
- **Date invalide** : Format YYYY-MM-DD non respecté
- **Rôle non reconnu** : Valeur non autorisée

#### Stratégies de résolution

1. **Rapport détaillé** : Identification précise des problèmes
2. **Correction du CSV** : Modification du fichier source
3. **Réimport** : Nouvel import après correction
4. **Création manuelle** : Pour cas complexes

---

## Bonnes pratiques

### Gestion des utilisateurs

#### Créations

- **Vérifiez l'unicité** : Email unique requis
- **Rôles appropriés** : Attribution selon les besoins
- **Mots de passe forts** : Pour examinateurs/admins
- **Communication** : Informez les nouveaux utilisateurs

#### Modifications

- **Sauvegarde préalable** : Export avant modifications importantes
- **Test des changements** : Vérification sur compte test
- **Documentation** : Trace des modifications effectuées

#### Suppressions

- **Double vérification** : Confirmation de l'utilisateur ciblé
- **Sauvegarde** : Export des données avant suppression
- **Alternative** : Désactivation plutôt que suppression

### Gestion des hackathons

#### Planification

- **Dates cohérentes** : Période réaliste et adaptée
- **Quotas réfléchis** : Équilibre entre liberté et coûts
- **Tâches claires** : Descriptions précises et réalisables

#### Configuration

- **Test préalable** : Mode "Test" avant publication
- **Anonymat réfléchi** : Selon les objectifs pédagogiques
- **Statut approprié** : Mise à jour selon l'avancement

#### Surveillance

- **Monitoring régulier** : Vérification de l'activité
- **Ajustements** : Modifications selon les retours
- **Archivage** : Conservation des données importantes

### Import en masse

#### Préparation

- **Nettoyage des données** : Vérification préalable
- **Test sur échantillon** : Import de quelques lignes d'abord
- **Validation format** : Respect strict du template

#### Exécution

- **Surveillance** : Monitoring du processus
- **Traitement des erreurs** : Correction immédiate si possible
- **Vérification finale** : Contrôle des comptes créés

### Sécurité

#### Authentification

- **Mots de passe forts** : Complexité appropriée
- **Sessions sécurisées** : Déconnexion après inactivité
- **Audit des actions** : Trace de toutes les opérations

#### Données

- **Sauvegardes régulières** : Export périodique
- **Accès limité** : Permissions selon les besoins
- **Confidentialité** : Respect des données personnelles

---

## Dépannage

### Problèmes de connexion

#### Échec d'authentification

**Symptômes :** Message "Email ou mot de passe incorrect"
**Solutions :**

1. Vérifiez l'orthographe de l'email
2. Contrôlez la casse du mot de passe
3. Videz le cache du navigateur
4. Essayez un navigateur différent

#### Session expirée

**Symptômes :** Redirection vers page de connexion
**Solutions :**

1. Reconnectez-vous normalement
2. Vérifiez la stabilité de votre connexion internet
3. Augmentez l'activité pour éviter le timeout

### Problèmes de gestion utilisateurs

#### Erreur de création

**Symptômes :** "L'email est déjà utilisé"
**Solutions :**

1. Vérifiez l'unicité de l'email
2. Utilisez un autre email
3. Modifiez l'utilisateur existant si approprié

#### Import CSV échoué

**Symptômes :** Erreurs multiples lors de l'import
**Solutions :**

1. Vérifiez le format du fichier CSV
2. Contrôlez l'encodage (UTF-8)
3. Utilisez le template fourni
4. Vérifiez la structure des données

### Problèmes de hackathons

#### Sauvegarde impossible

**Symptômes :** Erreur lors de l'enregistrement
**Solutions :**

1. Vérifiez tous les champs obligatoires
2. Contrôlez la cohérence des dates
3. Validez les quotas (nombres positifs)
4. Rafraîchissez la page et réessayez

#### Hackathon invisible pour étudiants

**Symptômes :** Hackathon non affiché côté étudiant
**Solutions :**

1. Vérifiez le statut ("En cours" requis)
2. Contrôlez les dates (période active)
3. Vérifiez la sauvegarde effective

### Problèmes de performance

#### Interface lente

**Symptômes :** Chargement lent des pages
**Solutions :**

1. Videz le cache du navigateur
2. Vérifiez votre connexion internet
3. Fermez les onglets inutiles
4. Redémarrez le navigateur

#### Tableaux non responsive

**Symptômes :** Affichage décalé sur mobile
**Solutions :**

1. Utilisez le scroll horizontal
2. Tournez l'appareil en landscape
3. Utilisez un ordinateur pour les tâches complexes

#### Informations à fournir

Pour un support efficace, incluez :

- **Votre email administrateur**
- **Description détaillée du problème**
- **Étapes pour reproduire l'erreur**
- **Captures d'écran si applicable**
- **Navigateur et version utilisés**
- **Messages d'erreur complets**

### FAQ administrative

#### Q: Comment réinitialiser le mot de passe d'un utilisateur ?

R: Éditez l'utilisateur et entrez un nouveau mot de passe. Laissez vide pour conserver l'ancien.

#### Q: Puis-je supprimer un hackathon en cours ?

R: Oui, mais toutes les conversations et évaluations associées seront perdues définitivement.

#### Q: Comment gérer les doublons d'email ?

R: Le système empêche la création de doublons. Modifiez l'email existant ou utilisez un autre email.

#### Q: L'import CSV fonctionne-t-il avec Excel ?

R: Sauvegardez votre fichier Excel au format CSV (UTF-8) avant l'import.

#### Q: Comment voir les conversations des étudiants ?

R: Cette fonctionnalité est disponible dans le dashboard examinateur pour l'évaluation.

#### Q: Puis-je modifier un hackathon après sa création ?

R: Oui, toutes les modifications sont possibles et prennent effet immédiatement.
