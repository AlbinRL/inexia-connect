import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
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
