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
                id: number;
                nom: string;
                ville: string;
            };
            equipements: ({
                materiel: {
                    id: number;
                    nom: string;
                };
            } & {
                id: number;
                salleId: number;
                quantite: number;
                materielId: number;
            })[];
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
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
            id: number;
            nom: string;
            prenom: string;
        };
        salle: {
            site: {
                id: number;
                nom: string;
            };
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
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
            id: number;
            nom: string;
            prenom: string;
        };
        salle: {
            site: {
                id: number;
                nom: string;
            };
            equipements: ({
                materiel: {
                    id: number;
                    nom: string;
                };
            } & {
                id: number;
                salleId: number;
                quantite: number;
                materielId: number;
            })[];
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
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
        salle: {
            id: number;
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
    }) | null>;
}
