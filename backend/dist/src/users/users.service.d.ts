import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        nom: string;
        id: number;
        email: string;
        prenom: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findOne(id: number): Promise<{
        nom: string;
        id: number;
        email: string;
        prenom: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
