import { PrismaService } from '../prisma/prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(utilisateurId: number, salleId: number, date: string): Promise<{
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    }>;
    findByUser(userId: number): Promise<({
        salle: {
            site: {
                nom: string;
                id: number;
                ville: string;
            };
            equipements: {
                nom: string;
                id: number;
                salleId: number;
                actif: boolean;
            }[];
        } & {
            nom: string;
            id: number;
            capacite: number;
            siteId: number;
        };
    } & {
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
}
