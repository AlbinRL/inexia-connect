import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getLocalDayBoundsFromDateKey;
    findByUserId(userId: number): Promise<({
        salle: {
            site: {
                nom: string;
                ville: string;
                id: number;
            };
        } & {
            nom: string;
            id: number;
            capacite: number;
            siteId: number;
        };
    } & {
        id: number;
        dateDebut: Date;
        dateFin: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    findAll(filters?: {
        siteId?: number;
        date?: string;
    }): Promise<({
        utilisateur: {
            nom: string;
            id: number;
            prenom: string;
        };
        salle: {
            site: {
                nom: string;
                id: number;
            };
        } & {
            nom: string;
            id: number;
            capacite: number;
            siteId: number;
        };
    } & {
        id: number;
        dateDebut: Date;
        dateFin: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    findByUser(userId: number): Promise<({
        utilisateur: {
            nom: string;
            id: number;
            prenom: string;
        };
        salle: {
            site: {
                nom: string;
                id: number;
            };
        } & {
            nom: string;
            id: number;
            capacite: number;
            siteId: number;
        };
    } & {
        id: number;
        dateDebut: Date;
        dateFin: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    create(userId: number, dto: CreateReservationDto): Promise<{
        id: number;
        dateDebut: Date;
        dateFin: Date;
        utilisateurId: number;
        salleId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        dateDebut: Date;
        dateFin: Date;
        utilisateurId: number;
        salleId: number;
    }>;
}
