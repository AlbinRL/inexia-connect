import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
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
        date: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    findAll(filters?: {
        siteId?: number;
        date?: string;
    }): Promise<({
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
        utilisateur: {
            nom: string;
            id: number;
            prenom: string;
        };
    } & {
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    findByUser(userId: number): Promise<({
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
        utilisateur: {
            nom: string;
            id: number;
            prenom: string;
        };
    } & {
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    create(userId: number, dto: CreateReservationDto): Promise<{
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    }>;
}
