import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    // Si pas de @Roles, la route est publique
    if (!roles || roles.length === 0) {
      return true;
    }
    // Sinon, vérifier le JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    // Si public, on laisse passer même sans user
    if (!roles || roles.length === 0) {
      return user || null;
    }
    // Si protégé mais pas d'utilisateur
    if (err || !user) {
      throw err || new UnauthorizedException('Authentification requise');
    }
    // Vérifier le rôle
    const userRole = user.role;
    if (!roles.includes(userRole)) {
      throw new UnauthorizedException(`Rôle ${userRole} non autorisé. Rôles acceptés : ${roles.join(', ')}`);
    }
    return user;
  }
}
