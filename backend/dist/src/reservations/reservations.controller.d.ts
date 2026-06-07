import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(body: {
        utilisateurId: number;
        salleId: number;
        date: string;
    }): Promise<{
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
            siteId: number;
            capacite: number;
        };
    } & {
        id: number;
        date: Date;
        utilisateurId: number;
        salleId: number;
    })[]>;
}
