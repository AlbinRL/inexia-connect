"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Nettoyage de la base...');
    await prisma.reservation.deleteMany();
    await prisma.equipement.deleteMany();
    await prisma.salle.deleteMany();
    await prisma.site.deleteMany();
    await prisma.utilisateur.deleteMany();
    console.log('Création des données...');
    const hashedPassword = await bcrypt.hash('1234', 10);
    const admin = await prisma.utilisateur.create({
        data: {
            nom: 'Roustan-Labouret',
            prenom: 'Albin',
            email: 'admin@inexia.fr',
            motDePasse: hashedPassword,
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
    const siteMontpellier = await prisma.site.create({
        data: { nom: 'Agence Montpellier', ville: 'Montpellier' },
    });
    const siteLyon = await prisma.site.create({
        data: { nom: 'Agence Lyon', ville: 'Lyon' },
    });
    const salleMistral = await prisma.salle.create({
        data: { nom: 'Salle Mistral', capacite: 10, siteId: siteMontpellier.id },
    });
    const salleLumiere = await prisma.salle.create({
        data: { nom: 'Salle Lumière', capacite: 4, siteId: siteLyon.id },
    });
    await prisma.equipement.createMany({
        data: [
            { nom: 'Vidéoprojecteur 4K', actif: true, salleId: salleMistral.id },
            { nom: 'Double écran', actif: true, salleId: salleLumiere.id },
        ],
    });
    await prisma.reservation.create({
        data: {
            date: new Date('2026-06-10T09:00:00Z'),
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
//# sourceMappingURL=seed.js.map