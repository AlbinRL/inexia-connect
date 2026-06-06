import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        email: string;
        nom: string;
        prenom: string;
        role: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        nom: string;
        prenom: string;
        role: string;
    }>;
}
