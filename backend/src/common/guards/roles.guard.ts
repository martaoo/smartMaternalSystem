import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get('roles', context.getHandler());
    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) return false;

    // SUPER_ADMIN bypasses all role restrictions — has access to everything
    if (user.role === 'SUPER_ADMIN') return true;

    return roles.includes(user.role);
  }
}
