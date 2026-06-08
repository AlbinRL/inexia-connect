"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const site = await prisma.site.create({
        data: { nom: 'Inexia Montpellier', ville: 'Montpellier' },
    });
    const pc = await prisma.materiel.create({ data: { nom: 'Ordinateur' } });
    const video = await prisma.materiel.create({ data: { nom: 'Vidéoprojecteur' } });
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
//# sourceMappingURL=seed.js.map