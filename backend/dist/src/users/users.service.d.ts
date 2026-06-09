import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        nom: string;
        id: number;
        prenom: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findOne(id: number): Promise<{
        nom: string;
        id: number;
        siteId: number | null;
        prenom: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
