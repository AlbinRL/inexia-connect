// Ce fichier sert a gerer la logique metier du referentiel materiel.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Materiel } from '@prisma/client';

@Injectable()
export class MaterielService {
  constructor(private readonly prisma: PrismaService) {}

  // Référentiel central: un matériel est défini une seule fois par son nom.
  async create(data: { nom: string }): Promise<Materiel> {
    return this.prisma.materiel.create({
      data,
    });
  }

  // Liste complète utilisée par les écrans d'administration et les formulaires de salle.
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
    // Vérification existence avant update pour retourner une erreur claire.
    await this.findOne(id);
    return this.prisma.materiel.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Materiel> {
    // Même logique de garde pour éviter un delete silencieux sur ID invalide.
    await this.findOne(id);
    return this.prisma.materiel.delete({
      where: { id },
    });
  }
}
