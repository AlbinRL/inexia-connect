import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
