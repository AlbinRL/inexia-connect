import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        id: number;
    }>;
}
