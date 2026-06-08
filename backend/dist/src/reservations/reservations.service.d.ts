import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private formatReservationSlot;
    private cleanupExpiredCancelledReservations;
    private getCurrentReservationStatus;
    private withStatus;
    private getLocalDayBoundsFromDateKey;
    private getPeakOccupancy;
    getAvailabilityForSlot(dateDebut: string, dateFin: string): Promise<{
        salleId: number;
        capacity: number;
        occupied: number;
        available: number;
    }[]>;
    findByUserId(userId: number): Promise<({
        salle: {
            site: {
                nom: string;
                ville: string;
                id: number;
            };
            equipements: ({
                materiel: {
                    nom: string;
                    id: number;
                };
            } & {
                id: number;
                quantite: number;
                materielId: number;
                salleId: number;
            })[];
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
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    } & {
        statut: string;
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
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    } & {
        statut: string;
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
            equipements: ({
                materiel: {
                    nom: string;
                    id: number;
                };
            } & {
                id: number;
                quantite: number;
                materielId: number;
                salleId: number;
            })[];
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
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    } & {
        statut: string;
    })[]>;
    create(userId: number, dto: CreateReservationDto): Promise<{
        id: number;
        dateDebut: Date;
        dateFin: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    } & {
        statut: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        dateDebut: Date;
        dateFin: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    }>;
    findById(id: number): Promise<({
        id: number;
        dateDebut: Date;
        dateFin: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    } & {
        statut: string;
    }) | null>;
}
