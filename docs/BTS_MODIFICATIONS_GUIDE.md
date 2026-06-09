# Guide BTS - Comprendre et modifier Inexia Connect

Ce document sert de support d'oral: il explique comment une modification part de la base de donnees jusqu'a l'affichage (web et mobile).

## 1) Architecture globale (vue simple)

- Base de donnees: PostgreSQL via Prisma (`backend/prisma/schema.prisma`)
- API metier: NestJS (`backend/src/**`)
- Front web: Next.js App Router (`inexia-web/app/**`)
- Front mobile: React Native (`mobile/src/**`)

Flux standard:

1. Le front envoie une requete HTTP avec JWT.
2. Le controller Nest valide l'acces (guards/roles).
3. Le service applique les regles metier.
4. Prisma lit/ecrit en base.
5. La reponse JSON est affichee dans web/mobile.

## 2) Regle d'or pour une modification

Toujours traiter la modification dans cet ordre:

1. Schema de donnees (si necessaire)
2. Service backend (regles metier)
3. Controller backend (route et autorisations)
4. Contrat API (types DTO / champs JSON)
5. UI web et UI mobile
6. Tests manuels et, idealement, tests automatises

## 3) Dossier par dossier: a quoi ca sert

### Backend

- `backend/prisma/schema.prisma`: modele de donnees (tables, relations, enums)
- `backend/src/**/controller.ts`: endpoints REST
- `backend/src/**/service.ts`: logique metier
- `backend/src/auth/**`: JWT + roles
- `backend/prisma/migrations/**`: historique des migrations

### Web

- `inexia-web/src/context/AuthContext.tsx`: session, login/logout, role routing
- `inexia-web/app/reservation/page.tsx`: filtre salles + disponibilite + creation reservation

### Mobile

- `mobile/src/services/api.ts`: client HTTP centralise + typage des reponses
- `mobile/src/components/AppHeader.tsx`: header et menu utilisateur

## 4) Procedure type: ajouter un nouveau champ metier

Exemple: ajouter `description` sur une salle.

### Etape A - Base de donnees

1. Modifier `backend/prisma/schema.prisma`:
   - model `Salle` -> ajouter `description String?`
2. Generer la migration Prisma dans `backend`:

```bash
npm run prisma:migrate -- --name add_salle_description
```

3. Verifier que la migration est creee dans `backend/prisma/migrations/...`.

### Etape B - Backend Nest

1. Mettre a jour la creation/modification des salles dans:
   - `backend/src/salles/salles.controller.ts`
   - `backend/src/salles/salles.service.ts`
2. Sanitizer les donnees (trim) si necessaire.
3. Verifier les droits (ADMIN/DIRECTEUR selon besoin).

### Etape C - Web

1. Ajouter le champ dans le formulaire de salle (admin/directeur).
2. Afficher le champ dans la carte/detail salle.
3. Si TypeScript est strict, mettre a jour le type local `Salle`.

### Etape D - Mobile

1. Mettre a jour `MobileRoom` dans `mobile/src/services/api.ts`.
2. Afficher la description dans les ecrans concernes.

### Etape E - Validation

- Test creation salle avec description
- Test affichage web + mobile
- Test non-regression reservation

## 5) Procedure type: changer une regle metier de reservation

Exemple: imposer une duree max de 4 heures.

### Etape A - Service backend

Fichier cle: `backend/src/reservations/reservations.service.ts`

1. Dans `create`, calculer la duree: `end - start`.
2. Si > 4h, throw `BadRequestException`.
3. Garder la validation avant l'ecriture DB.

### Etape B - Feedback web/mobile

- Web: `inexia-web/app/reservation/page.tsx` recupere deja les messages backend.
- Mobile: afficher le `message` de la reponse d'erreur dans l'ecran de reservation.

### Etape C - Tests manuels

- Reservation de 2h (OK)
- Reservation de 5h (KO)

## 6) Procedure type: ajouter un filtre d'affichage

Exemple: filtrer les salles par materiel (ex: videoprojecteur).

### Backend (optionnel)

- Si les donnees necessaires sont deja dans `/sites` et `/salles`, filtrer cote front suffit.
- Sinon enrichir les includes Prisma:
  - `backend/src/sites/sites.service.ts`
  - `backend/src/salles/salles.service.ts`

### Web

1. Ajouter un select filtre dans `inexia-web/app/reservation/page.tsx`.
2. Etendre `filteredRooms` (useMemo) avec une condition sur `equipements`.

### Mobile

1. Ajouter le meme filtre sur la liste de salles.
2. Reutiliser les champs de `MobileRoom.equipements`.

## 7) Points sensibles a maitriser pour le jury

- Authentification:
  - Les routes backend critiques sont protegees par JWT + roles.
  - Sans token, les appels `/sites`, `/salles`, `/reservations` peuvent retourner 401.

- Reservation concurrente:
  - La creation de reservation est encapsulee dans une transaction.
  - Le service verifie conflits utilisateur + capacite de salle sur le creneau.

- Disponibilite:
  - Endpoint dedie `/reservations/availability`.
  - Le front calcule le creneau et affiche les places restantes.

## 8) Checklist avant de livrer une modification

1. La base est migree correctement.
2. Les roles ont ete verifies (ADMIN/DIRECTEUR/USER).
3. Les types TypeScript sont coherents (backend + web + mobile).
4. Les messages d'erreur sont explicites pour l'utilisateur.
5. Le parcours principal fonctionne de bout en bout.

## 9) Trame de reponse a l'oral (rapide)

Tu peux repondre avec ce schema:

1. "Je pars du besoin metier et j'identifie la donnee impactee dans Prisma."
2. "Je modifie ensuite le service Nest pour les regles metier."
3. "Je securise l'acces dans le controller avec les roles."
4. "J'adapte les types et l'affichage web/mobile."
5. "Je valide en testant un cas nominal et un cas erreur."

Cette trame montre une vision complete full-stack et rassure le jury sur ta methode.