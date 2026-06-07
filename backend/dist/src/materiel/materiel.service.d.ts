import { PrismaService } from '../prisma/prisma.service';
import { Materiel } from '@prisma/client';
export declare class MaterielService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        nom: string;
        quantiteTotale: number;
        siteId: number;
    }): Promise<Materiel>;
    findAll(siteId?: number): Promise<Materiel[]>;
    findOne(id: number): Promise<Materiel>;
    update(id: number, data: {
        nom?: string;
        quantiteTotale?: number;
        siteId?: number;
    }): Promise<Materiel>;
    remove(id: number): Promise<Materiel>;
}
