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
    }>;
    findAll(): Promise<{
        nom: string;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        nom: string;
        id: number;
    }>;
    update(id: number, body: {
        nom?: string;
        quantiteTotale?: number;
        siteId?: number;
    }): Promise<{
        nom: string;
        id: number;
    }>;
    remove(id: number): Promise<{
        nom: string;
        id: number;
    }>;
}
