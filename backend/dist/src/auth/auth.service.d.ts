import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(data: {
        email: string;
        motDePasse: string;
        nom: string;
        prenom: string;
        siteId?: number;
    }): Promise<{
        access_token: string;
        utilisateur: {
            id: number;
            nom: string;
            prenom: string;
            role: import("@prisma/client").$Enums.Role;
            siteId: number | null;
        };
    }>;
    login(email: string, motDePasse: string): Promise<{
        access_token: string;
        utilisateur: {
            id: number;
            nom: string;
            prenom: string;
            role: import("@prisma/client").$Enums.Role;
            siteId: number | null;
        };
    }>;
}
