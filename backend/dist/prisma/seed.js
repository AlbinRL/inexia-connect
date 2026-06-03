"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Début du remplissage de la base de données (Seeding)...');
    const albin = await prisma.utilisateur.upsert({
        where: { email: 'albin.roustan@inexia.fr' },
        update: {},
        create: {
            email: 'albin.roustan@inexia.fr',
            nom: 'Roustan',
            prenom: 'Albin',
            mot_de_passe: 'password123',
            role: 'admin',
        },
    });
    const collaborateur = await prisma.utilisateur.upsert({
        where: { email: 'collaborateur@inexia.fr' },
        update: {},
        create: {
            email: 'collaborateur@inexia.fr',
            nom: 'Dupont',
            prenom: 'Jean',
            mot_de_passe: 'password123',
            role: 'collaborateur',
        },
    });
    const siteParis = await prisma.site.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            nom_site: 'Siège Inexia Paris',
            ville: 'Paris',
            adresse: '15 Rue de la Paix, 75000 Paris',
        },
    });
    const projecteur = await prisma.equipement.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, libelle: 'Vidéoprojecteur 4K' },
    });
    const salleReunion = await prisma.salle.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            nom_salle: 'Salle Apollo',
            etage: 2,
            type: 'Réunion',
            capacite: 10,
            id_site: siteParis.id,
            equipements: { connect: [{ id: projecteur.id }] },
        },
    });
    const reservation = await prisma.reservation.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            date_debut: new Date(new Date().setHours(14, 0, 0, 0)),
            date_fin: new Date(new Date().setHours(16, 0, 0, 0)),
            statut: 'confirmé',
            id_u: albin.id,
            id_sa: salleReunion.id,
        },
    });
    console.log('Données créées avec succès !');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map