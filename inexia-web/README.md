# Inexia Web

Frontend web de Inexia Connect (Next.js), connecte a l API NestJS du dossier backend.

## Demarrage rapide

1. Lancer le backend depuis le dossier backend.
    ```bash
    cd ../backend
    npm run start:dev
    ```
2. Lancer le frontend depuis ce dossier inexia-web.

Commandes utiles :

```bash
# terminal 1 (backend)
cd ../backend
npm install
npm run start:dev

# terminal 2 (frontend web)
cd ../inexia-web
npm install
npm run dev
```

Application web : http://localhost:3000

## Configuration API

Le frontend appelle l API via la variable NEXT_PUBLIC_API_URL.

Exemple de fichier .env.local :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Si la variable est absente, certaines pages utilisent une valeur par defaut en local.

## Cheminement type: ajouter une nouvelle colonne puis l afficher sur le front

Exemple concret: ajouter la colonne description sur la table Salle et l afficher dans la page de reservation.

### Etape 1 - Base de donnees (Prisma)

Fichier a modifier :
- ../backend/prisma/schema.prisma

Dans le model Salle, ajouter :

```prisma
description String?
```

Puis generer la migration :

```bash
cd ../backend
npm run prisma:migrate -- --name add_salle_description
```

Resultat attendu :
- un nouveau dossier de migration dans ../backend/prisma/migrations
- la colonne description creee en base

### Etape 2 - Service backend (logique metier)

Fichier principal :
- ../backend/src/salles/salles.service.ts

A faire :
1. Autoriser le champ description dans create.
2. Autoriser le champ description dans update.
3. Retourner le champ dans les reponses (si projection selective).

Exemple d adaptation create/update :

```ts
create(data: {
	nom: string;
	capacite: number;
	siteId: number;
	description?: string;
	equipements?: { materielId: number; quantite: number }[];
}) {
	return this.prisma.salle.create({
		data: {
			nom: data.nom.trim(),
			capacite: data.capacite,
			siteId: data.siteId,
			description: data.description?.trim() ?? null,
		},
	});
}
```

### Etape 3 - Controller backend (contrat API)

Fichier principal :
- ../backend/src/salles/salles.controller.ts

A faire :
1. Ajouter description dans le type du body de create.
2. Ajouter description dans le type du body de update.

Objectif : le frontend peut envoyer ce nouveau champ sans etre ignore.

Detail pratique (ce qu il faut modifier exactement) :

1. Dans la methode `create`, ajouter `description?: string` dans le type du `@Body()`.
2. Dans la methode `update`, ajouter aussi `description?: string` dans le type du `@Body()`.
3. Ne pas toucher aux regles de droits (DIRECTEUR/ADMIN) deja en place.
4. Verifier que le body est bien transfere tel quel au service (`this.sallesService.create(body)` et `this.sallesService.update(id, body)`).

Exemple type pour `create` :

```ts
@Post()
create(
	@Req() req: { user: { role: string; siteId: number | null } },
	@Body()
	body: {
		nom: string;
		capacite: number;
		siteId: number;
		description?: string;
		equipements?: { materielId: number; quantite: number }[];
	},
) {
	if (req.user.role === 'DIRECTEUR' && req.user.siteId !== body.siteId) {
		throw new ForbiddenException('Acces limite au site rattache');
	}

	return this.sallesService.create(body);
}
```

Exemple type pour `update` :

```ts
@Put(':id')
async update(
	@Param('id', ParseIntPipe) id: number,
	@Req() req: { user: { role: string; siteId: number | null } },
	@Body()
	body: {
		nom?: string;
		capacite?: number;
		siteId?: number;
		description?: string;
		equipements?: { materielId: number; quantite: number }[];
	},
) {
	// controles de portee inchanges...
	return this.sallesService.update(id, body);
}
```

Mini check de validation apres modification :
1. POST /salles (creation avec description)
	- Envoyer un body avec `description`.
	- Attendu: code 201 et champ `description` present dans la reponse.
2. PUT /salles/:id (mise a jour de description)
	- Modifier uniquement `description` sur une salle existante.
	- Attendu: code 200 et nouvelle valeur visible dans la reponse.
3. GET /salles (lecture)
	- Relire la liste des salles.
	- Attendu: la salle modifiee contient bien `description`.
4. Test du cas optionnel (sans description)
	- Creer ou modifier une salle sans envoyer `description`.
	- Attendu: pas d erreur 400/500, l endpoint continue de fonctionner.
5. Verification front
	- Ouvrir la page reservation.
	- Attendu: la description s affiche quand elle existe, et aucun bloc vide sinon.

Comment faire concretement (Prisma Studio) :

Pre-requis : la colonne `description` existe deja en base via migration.

1. Ouvrir Prisma Studio
```bash
cd ../backend
npx prisma studio
```

2. Modifier une salle existante
1. Ouvrir la table `Salle`.
2. Choisir une ligne.
3. Remplir le champ `description` (ex: "Salle test pour valider la nouvelle colonne").
4. Sauvegarder la ligne.

3. Tester le cas optionnel
1. Prendre une autre salle.
2. Laisser `description` vide (null) ou effacer la valeur.
3. Sauvegarder.

4. Verifier cote backend (lecture)
1. Faire un GET `/salles` (Postman, navigateur, ou autre outil).
2. Verifier que la salle modifiee contient `description`.
3. Verifier que la salle sans valeur renvoie `description: null` ou champ absent selon le mapping.

5. Verification front (manuel)
1. Ouvrir http://localhost:3000/reservation
2. Verifier que la salle avec description affiche le texte
3. Verifier que la salle sans description ne montre pas de bloc vide

Important : Prisma Studio est pratique pour tester les donnees, mais ne remplace pas les migrations de schema.

### Etape 4 - Types frontend (Next.js)

Fichier principal :
- app/reservation/page.tsx

Dans le type Salle, ajouter :

```ts
type Salle = {
	id: number;
	nom: string;
	capacite: number;
	siteId: number;
	description?: string | null;
	equipements?: Equipement[];
};
```

### Etape 5 - Affichage frontend

Fichier principal :
- app/reservation/page.tsx

Dans la carte salle, afficher la description :

```tsx
{room.description ? (
	<p className="mt-2 text-sm text-slate-600">{room.description}</p>
) : null}
```

### Etape 6 - Formulaire frontend (si edition/creation)

Si tu as un formulaire de creation/modification de salle :
1. Ajouter un champ description dans le formulaire.
2. L inclure dans le body envoye au backend.
3. Afficher le message d erreur backend si validation KO.

### Etape 7 - Verification complete

Checklist de validation :
1. La migration est appliquee sans erreur.
2. Une salle peut etre creee avec description.
3. Une salle peut etre modifiee avec description.
4. Le GET des salles retourne description.
5. La page web affiche correctement description.
6. Les cas sans description n affichent pas de bloc vide.

## Autre exemple rapide: ajouter une colonne metier Reservee

Si tu ajoutes un champ sensible au temps (ex: priorite, statutSupplementaire) :
1. Faire la colonne en base.
2. Mettre la regle metier dans le service backend.
3. Exposer proprement dans le controller.
4. Adapter types + UI.
5. Tester un cas nominal et un cas erreur.

## Erreurs courantes et solution

1. Le champ existe en base mais pas dans la reponse API.
Cause: service/controller non adaptes.
Solution: verifier create/update/findAll/findOne.

2. Le champ est envoye par le front mais ignore.
Cause: type body controller incomplet.
Solution: ajouter le champ dans le body attendu.

3. Le front plante sur undefined.
Cause: type TS trop strict ou affichage sans garde.
Solution: utiliser champ optionnel et condition d affichage.

4. 401 sur les routes.
Cause: token absent.
Solution: verifier Authorization Bearer token cote front.

## Trame orale courte (jury)

Tu peux expliquer comme ceci :
1. J ajoute d abord la colonne dans Prisma et je fais une migration.
2. J adapte la logique metier dans le service Nest.
3. J adapte le contrat HTTP dans le controller.
4. Je mets a jour les types et l affichage dans Next.js.
5. Je valide de bout en bout avec un test de creation et de lecture.

## Ressources

- Documentation Next.js : https://nextjs.org/docs
- Documentation NestJS : https://docs.nestjs.com
- Documentation Prisma : https://www.prisma.io/docs
