import { ReservationsService } from './reservations.service';
import { Request as ExpressRequest } from 'express';
type AuthenticatedRequest = ExpressRequest & {
    user: {
        sub: number;
        role?: string;
    };
};
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    findMyReservations(req: AuthenticatedRequest): Promise<({
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
    findUserReservations(req: AuthenticatedRequest, userId: number): Promise<({
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
    findAll(query: {
        siteId?: string;
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
