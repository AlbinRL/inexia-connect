import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        motDePasse: string;
    }): Promise<{
        access_token: string;
        utilisateur: {
            id: number;
            nom: string;
            prenom: string;
            role: string;
        };
    }>;
}
