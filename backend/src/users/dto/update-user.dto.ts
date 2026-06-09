// Ce fichier sert a definir le DTO de mise a jour partielle d'utilisateur.
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
