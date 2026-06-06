import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(body: {
        utilisateurId: number;
        salleId: number;
        date: string;
    }): Promise<{
        date: Date;
        id: number;
        utilisateurId: number;
        salleId: number;
    }>;
    findByUser(userId: number): Promise<({
        salle: {
            site: {
                id: number;
                nom: string;
                ville: string;
            };
            equipements: {
                id: number;
                salleId: number;
                nom: string;
                actif: boolean;
            }[];
        } & {
            id: number;
            nom: string;
            capacite: number;
            siteId: number;
        };
    } & {
        date: Date;
        id: number;
        utilisateurId: number;
        salleId: number;
    })[]>;
}
