import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const seedPassword = 'password123';

function makeLocalDateTime(daysOffset: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.reservation.deleteMany();
    await tx.equipement.deleteMany();
    await tx.salle.deleteMany();
    await tx.utilisateur.deleteMany();
    await tx.materiel.deleteMany();
    await tx.site.deleteMany();
  });

  const [passwordHashAdmin, passwordHashCollaborator, passwordHashDirector] = await Promise.all([
    bcrypt.hash(seedPassword, 10),
    bcrypt.hash(seedPassword, 10),
    bcrypt.hash(seedPassword, 10),
  ]);

  const montpellier = await prisma.site.create({
    data: { nom: 'Inexia Montpellier', ville: 'Montpellier' },
  });

  const paris = await prisma.site.create({
    data: { nom: 'Inexia - Paris - 2ème arrondissement ', ville: 'Paris' },
  });

  const ordinateurs = await prisma.materiel.create({ data: { nom: 'Ordinateur' } });
  const videoprojecteur = await prisma.materiel.create({ data: { nom: 'Vidéoprojecteur' } });
  const imprimante = await prisma.materiel.create({ data: { nom: 'Imprimante' } });
  const pieuvre = await prisma.materiel.create({ data: { nom: 'Pieuvre audio' } });

  const salleReunion102 = await prisma.salle.create({
    data: {
      nom: 'Salle de réunion 102',
      capacite: 10,
      siteId: montpellier.id,
      equipements: {
        create: [
          { materielId: ordinateurs.id, quantite: 2 },
          { materielId: videoprojecteur.id, quantite: 1 },
        ],
      },
    },
  });

  const bureau301 = await prisma.salle.create({
    data: {
      nom: 'Bureau 301',
      capacite: 3,
      siteId: montpellier.id,
      equipements: {
        create: [
          { materielId: imprimante.id, quantite: 1 },
          { materielId: ordinateurs.id, quantite: 3 },
        ],
      },
    },
  });

  const bureau102Paris = await prisma.salle.create({
    data: {
      nom: 'Bureau 102',
      capacite: 3,
      siteId: paris.id,
      equipements: {
        create: [
          { materielId: pieuvre.id, quantite: 1 },
          { materielId: ordinateurs.id, quantite: 1 },
        ],
      },
    },
  });

  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'admin',
      prenom: 'admin',
      email: 'admin@inexia.fr',
      motDePasse: passwordHashAdmin,
      role: 'ADMIN',
      siteId: montpellier.id,
    },
  });

  const collaborator = await prisma.utilisateur.create({
    data: {
      nom: 'Roustan',
      prenom: 'Albin',
      email: 'albin@inexia.fr',
      motDePasse: passwordHashCollaborator,
      role: 'COLLABORATEUR',
      siteId: paris.id,
    },
  });

  const director = await prisma.utilisateur.create({
    data: {
      nom: 'Directeur',
      prenom: 'D',
      email: 'direct@inexia.fr',
      motDePasse: passwordHashDirector,
      role: 'DIRECTEUR',
      siteId: montpellier.id,
    },
  });

  await prisma.reservation.createMany({
    data: [
      {
        dateDebut: makeLocalDateTime(0, 9, 0),
        dateFin: makeLocalDateTime(0, 10, 0),
        utilisateurId: collaborator.id,
        salleId: salleReunion102.id,
      },
      {
        dateDebut: makeLocalDateTime(0, 10, 30),
        dateFin: makeLocalDateTime(0, 11, 30),
        utilisateurId: admin.id,
        salleId: bureau301.id,
      },
      {
        dateDebut: makeLocalDateTime(1, 8, 30),
        dateFin: makeLocalDateTime(1, 9, 30),
        utilisateurId: collaborator.id,
        salleId: bureau301.id,
      },
      {
        dateDebut: makeLocalDateTime(-1, 14, 0),
        dateFin: makeLocalDateTime(-1, 15, 0),
        utilisateurId: director.id,
        salleId: bureau102Paris.id,
      },
    ],
  });

  console.log('Seed terminé avec succès.');
  console.log('Compte admin: admin@inexia.fr / password123');
  console.log('Compte collaborateur: albin@inexia.fr / password123');
  console.log('Compte directeur: direct@inexia.fr / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
