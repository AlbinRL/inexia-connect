import { PrismaService } from '../prisma/prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(utilisateurId: number, salleId: number, date: string): Promise<{
        date: Date;
        id: number;
        utilisateurId: number;
        salleId: number;
    }>;
    findByUser(userId: number): Promise<({
        salle: {
            site: {
                id: number;
                nom: string;
                ville: string;
            };
            equipements: {
                id: number;
                salleId: number;
                nom: string;
                actif: boolean;
            }[];
        } & {
            id: number;
            nom: string;
            capacite: number;
            siteId: number;
        };
    } & {
        date: Date;
        id: number;
        utilisateurId: number;
        salleId: number;
    })[]>;
}
