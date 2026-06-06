import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        email: string;
        nom: string;
        prenom: string;
        role: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        nom: string;
        prenom: string;
        role: string;
    }>;
}
