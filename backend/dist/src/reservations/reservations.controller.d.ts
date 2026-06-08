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
    findUserReservations(req: AuthenticatedRequest, userId: number): Promise<({
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
    findAll(query: {
        siteId?: string;
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
    remove(id: number): Promise<{
        id: number;
        date: Date;
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
    create(req: AuthenticatedRequest, dto: {
        date: string;
        salleId: number;
    }): Promise<{
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    }>;
}
export {};
