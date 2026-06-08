require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = 4; // utilisateur à mettre à jour
  const siteId = 1; // site à assigner

  const updated = await prisma.utilisateur.update({
    where: { id: userId },
    data: { siteId },
  });

  console.log('Utilisateur mis à jour:', updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
