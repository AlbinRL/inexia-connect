import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Le guard intercepte toutes les requêtes protégées et vérifie le Bearer token.
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }
    try {
      // Le payload décodé est stocké dans request.user pour les controllers/services.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'INEXIA_SECRET_2026',
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Format attendu: Authorization: Bearer <token>
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
