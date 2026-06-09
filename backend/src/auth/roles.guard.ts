import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lit les rôles exigés par @Roles au niveau méthode puis classe.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      // Sans contrainte @Roles, on laisse passer (auth uniquement si JwtAuthGuard est présent).
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // Accès autorisé si au moins un rôle requis correspond au rôle du JWT.
    return requiredRoles.some((role) => user?.role === role);
  }
}
