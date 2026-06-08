require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const res = await prisma.reservation.findMany({
    include: { salle: { include: { site: true } }, utilisateur: true },
    orderBy: { date: 'desc' },
  });
  console.log(JSON.stringify(res, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
