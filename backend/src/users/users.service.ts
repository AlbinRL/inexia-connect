import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  // On injecte Prisma ici pour y avoir accès dans tout le fichier
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'Cette action ajoute un nouvel utilisateur';
  }

  // On modifie cette fonction pour aller chercher les vrais utilisateurs sur Supabase !
  async findAll() {
    return this.prisma.utilisateur.findMany();
  }

  findOne(id: number) {
    return `Cette action renvoie l'utilisateur #${id}`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `Cette action met à jour l'utilisateur #${id}`;
  }

  remove(id: number) {
    return `Cette action supprime l'utilisateur #${id}`;
  }
}
