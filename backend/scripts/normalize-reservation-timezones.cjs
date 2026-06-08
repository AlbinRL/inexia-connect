process.env.DATABASE_URL =
  'postgresql://postgres.xyodrakufzmysnihukvd:Inexiaconnect2765@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "Reservation"
    SET
      "dateDebut" = (("dateDebut" AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'UTC'),
      "dateFin" = (("dateFin" AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'UTC')
  `);

  console.log(`Updated ${updated} reservation row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
