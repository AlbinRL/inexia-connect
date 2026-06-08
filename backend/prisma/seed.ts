import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Création des sites
  const site = await prisma.site.create({
    data: { nom: 'Inexia Montpellier', ville: 'Montpellier' },
  });

  // 2. Création du référentiel matériel
  const pc = await prisma.materiel.create({ data: { nom: 'Ordinateur' } });
  const video = await prisma.materiel.create({ data: { nom: 'Vidéoprojecteur' } });

  // 3. Création des salles et équipement fixe
  await prisma.salle.create({
    data: {
      nom: 'Salle 102',
      capacite: 10,
      siteId: site.id,
      equipements: {
        create: [
          { materielId: pc.id, quantite: 2 },
          { materielId: video.id, quantite: 1 },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
