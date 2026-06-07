import { MaterielService } from './materiel.service';
export declare class MaterielController {
    private readonly materielService;
    constructor(materielService: MaterielService);
    create(body: {
        nom: string;
        quantiteTotale: number;
        siteId: number;
    }): Promise<{
        nom: string;
        id: number;
        siteId: number;
        quantiteTotale: number;
    }>;
    findAll(siteId?: string): Promise<{
        nom: string;
        id: number;
        siteId: number;
        quantiteTotale: number;
    }[]>;
    findOne(id: number): Promise<{
        nom: string;
        id: number;
        siteId: number;
        quantiteTotale: number;
    }>;
    update(id: number, body: {
        nom?: string;
        quantiteTotale?: number;
        siteId?: number;
    }): Promise<{
        nom: string;
        id: number;
        siteId: number;
        quantiteTotale: number;
    }>;
    remove(id: number): Promise<{
        nom: string;
        id: number;
        siteId: number;
        quantiteTotale: number;
    }>;
}
