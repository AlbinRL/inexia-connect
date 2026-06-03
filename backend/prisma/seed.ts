import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Début du remplissage de la base de données (Seeding)...');

  const albin = await prisma.utilisateur.upsert({
    where: { email: 'albin.roustan@inexia.fr' },
    update: {},
    create: {
      email: 'albin.roustan@inexia.fr',
      nom: 'Roustan',
      prenom: 'Albin',
      mot_de_passe: 'password123', // Penser à hacher mdp
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

  // 1. Création d'un Site
  const siteParis = await prisma.site.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, // On force l'ID pour que l'upsert fonctionne bien à chaque fois
      nom_site: 'Siège Inexia Paris',
      ville: 'Paris',
      adresse: '15 Rue de la Paix, 75000 Paris',
    },
  });

  // 2. Création d'un Équipement
  const projecteur = await prisma.equipement.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, libelle: 'Vidéoprojecteur 4K' },
  });

  // 3. Création d'une Salle liée au Site et à l'Équipement
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
      equipements: { connect: [{ id: projecteur.id }] }, // Liaison Many-to-Many
    },
  });

  // 4. Création d'une Réservation pour Albin dans la Salle Apollo
  const reservation = await prisma.reservation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      date_debut: new Date(new Date().setHours(14, 0, 0, 0)), // Aujourd'hui à 14h
      date_fin: new Date(new Date().setHours(16, 0, 0, 0)), // Aujourd'hui à 16h
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
