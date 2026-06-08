import { PrismaService } from '../prisma/prisma.service';
import { Materiel } from '@prisma/client';
export declare class MaterielService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        nom: string;
    }): Promise<Materiel>;
    findAll(): Promise<Materiel[]>;
    findOne(id: number): Promise<Materiel>;
    update(id: number, data: {
        nom?: string;
    }): Promise<Materiel>;
    remove(id: number): Promise<Materiel>;
}
