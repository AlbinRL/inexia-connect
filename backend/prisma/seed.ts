import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Nettoyage de la base...');
  await prisma.reservation.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.salle.deleteMany();
  await prisma.site.deleteMany();
  await prisma.utilisateur.deleteMany();

  console.log('Création des données...');

  // 1. Création des Utilisateurs
  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'Roustan-Labouret',
      prenom: 'Albin',
      email: 'admin@inexia.fr',
      motDePasse: '1234', // Mot de passe simple pour la démo
      role: 'ADMIN',
    },
  });

  await prisma.utilisateur.create({
    data: {
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'lyon@inexia.fr',
      motDePasse: '1234',
      role: 'DIRECTEUR',
    },
  });

  // 2. Création des Sites
  const siteMontpellier = await prisma.site.create({
    data: { nom: 'Agence Montpellier', ville: 'Montpellier' },
  });

  const siteLyon = await prisma.site.create({
    data: { nom: 'Agence Lyon', ville: 'Lyon' },
  });

  // 3. Création des Salles
  const salleMistral = await prisma.salle.create({
    data: { nom: 'Salle Mistral', capacite: 10, siteId: siteMontpellier.id },
  });

  const salleLumiere = await prisma.salle.create({
    data: { nom: 'Salle Lumière', capacite: 4, siteId: siteLyon.id },
  });

  // 4. Création des Équipements
  await prisma.equipement.createMany({
    data: [
      { nom: 'Vidéoprojecteur 4K', actif: true, salleId: salleMistral.id },
      { nom: 'Double écran', actif: true, salleId: salleLumiere.id },
    ],
  });

  // 5. Création d'une Réservation
  await prisma.reservation.create({
    data: {
      date: new Date('2026-06-10T09:00:00Z'), // Date de test
      utilisateurId: admin.id,
      salleId: salleMistral.id,
    },
  });

  console.log('Base de données remplie avec succès ! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
