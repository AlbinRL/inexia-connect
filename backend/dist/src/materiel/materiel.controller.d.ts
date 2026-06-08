import { MaterielService } from './materiel.service';
export declare class MaterielController {
    private readonly materielService;
    constructor(materielService: MaterielService);
    create(body: {
        nom: string;
        quantiteTotale: number;
        siteId: number;
    }): Promise<{
        id: number;
        nom: string;
    }>;
    findAll(): Promise<{
        id: number;
        nom: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nom: string;
    }>;
    update(id: number, body: {
        nom?: string;
        quantiteTotale?: number;
        siteId?: number;
    }): Promise<{
        id: number;
        nom: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        nom: string;
    }>;
}
