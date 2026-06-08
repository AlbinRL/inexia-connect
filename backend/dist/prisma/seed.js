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
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const seedPassword = 'password123';
function makeLocalDateTime(daysOffset, hour, minute) {
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
//# sourceMappingURL=seed.js.map