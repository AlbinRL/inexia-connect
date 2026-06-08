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
        date: Date;
        utilisateurId: number;
        salleId: number;
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
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
        };
    } & {
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
    findAll(): Promise<({
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
                id: number;
                nom: string;
                ville: string;
            };
        } & {
            id: number;
            nom: string;
            siteId: number;
            capacite: number;
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
