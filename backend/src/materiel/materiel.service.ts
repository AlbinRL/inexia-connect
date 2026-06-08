import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Materiel } from '@prisma/client';

@Injectable()
export class MaterielService {
  constructor(private readonly prisma: PrismaService) {}

  // Création simplifiée : on ne crée qu'un nom (le référentiel)
  async create(data: { nom: string }): Promise<Materiel> {
    return this.prisma.materiel.create({
      data,
    });
  }

  // findAll récupère maintenant tout le référentiel de matériel
  async findAll(): Promise<Materiel[]> {
    return this.prisma.materiel.findMany();
  }

  async findOne(id: number): Promise<Materiel> {
    const materiel = await this.prisma.materiel.findUnique({
      where: { id },
    });
    if (!materiel) {
      throw new NotFoundException(`Matériel avec l'ID ${id} introuvable`);
    }
    return materiel;
  }

  async update(id: number, data: { nom?: string }): Promise<Materiel> {
    await this.findOne(id);
    return this.prisma.materiel.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Materiel> {
    await this.findOne(id);
    return this.prisma.materiel.delete({
      where: { id },
    });
  }
}