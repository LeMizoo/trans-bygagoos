import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (err || !user) {
      // Autoriser l'accès si pas de rôles requis (routes publiques)
      if (!requiredRoles) return null;
      throw err || new Error('Non authentifié');
    }

    if (!requiredRoles) return user;
    if (!requiredRoles.includes(user.role)) {
      throw new Error('Accès non autorisé pour ce rôle');
    }
    return user;
  }
}
