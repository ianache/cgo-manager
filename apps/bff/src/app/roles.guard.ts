import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;

    if (!user) {
      this.logger.warn('Access denied: No user session found');
      return false;
    }

    const userRoles: string[] = (user.roles || []).map((r: string) => r.toLowerCase());
    const requiredRolesLower = requiredRoles.map(r => r.toLowerCase());
    
    const hasRole = requiredRolesLower.some((role) => userRoles.includes(role));
    
    if (!hasRole) {
      this.logger.error(`Access denied: User roles [${user.roles}] do not match required [${requiredRoles}]`);
      throw new ForbiddenException('User does not have the required role: ' + requiredRoles.join(', '));
    }
    
    return true;
  }
}
