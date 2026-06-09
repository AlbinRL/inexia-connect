import { ReservationsService } from './reservations.service';
import { Request as ExpressRequest } from 'express';
type AuthenticatedRequest = ExpressRequest & {
    user: {
        sub: number;
        role?: string;
        siteId?: number | null;
    };
};
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    findMyReservations(req: AuthenticatedRequest): Promise<({
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
                materielId: number;
                quantite: number;
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
    findUserReservations(req: AuthenticatedRequest, userId: number): Promise<({
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
                materielId: number;
                quantite: number;
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
    findAll(req: AuthenticatedRequest, query: {
        siteId?: string;
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
    getAvailability(query: {
        dateDebut?: string;
        dateFin?: string;
    }): Promise<{
        salleId: number;
        capacity: number;
        occupied: number;
        available: number;
    }[]>;
    remove(req: AuthenticatedRequest, id: number): Promise<{
        id: number;
        dateDebut: Date;
        dateFin: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    }>;
    findByUser(req: AuthenticatedRequest, userId: number): Promise<({
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
                materielId: number;
                quantite: number;
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
    create(req: AuthenticatedRequest, dto: {
        dateDebut: string;
        dateFin: string;
        salleId: number;
    }): Promise<{
        id: number;
        dateDebut: Date;
        dateFin: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        utilisateurId: number;
        salleId: number;
    } & {
        statut: string;
    }>;
}
export {};
