import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        motDePasse: string;
        nom: string;
        prenom: string;
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
    login(body: {
        email: string;
        motDePasse: string;
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
}
