// Ce fichier sert a valider le payload de creation d'utilisateur.
import { IsEmail, IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	motDePasse: string;

	@IsString()
	@IsNotEmpty()
	nom: string;

	@IsString()
	@IsNotEmpty()
	prenom: string;

	@IsOptional()
	@IsNumber()
	siteId?: number;
}
