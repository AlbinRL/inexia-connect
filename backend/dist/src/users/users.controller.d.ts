import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
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
