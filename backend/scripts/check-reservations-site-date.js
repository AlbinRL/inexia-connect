require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const siteId = 1;
  // date to check: today in server local date
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(today.getUTCDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD

  const day = new Date(dateStr);
  const next = new Date(day);
  next.setDate(next.getDate() + 1);

  const res = await prisma.reservation.findMany({
    where: {
      date: {
        gte: day,
        lt: next,
      },
      salle: { siteId },
    },
    include: { salle: { include: { site: true } }, utilisateur: true },
    orderBy: { date: 'asc' },
  });

  console.log('Checking reservations for site', siteId, 'date', dateStr);
  console.log(JSON.stringify(res, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
