import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        nom: string;
        prenom: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nom: string;
        prenom: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        siteId: number | null;
    }>;
}
