import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('DEBUG RolesGuard - Required roles:', requiredRoles);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    console.log('DEBUG RolesGuard - Raw token:', token?.substring(0, 20) + '...');
    
    const { user } = request;
    
    console.log('DEBUG RolesGuard - User from request:', user);
    console.log('DEBUG RolesGuard - User role:', user?.role);
    console.log('DEBUG RolesGuard - User role type:', typeof user?.role);
    
    if (!user || !user.role) {
      console.log('DEBUG RolesGuard - No user or role found');
      return false;
    }
    
    const hasRole = requiredRoles.some((role) => user.role === role);
    console.log('DEBUG RolesGuard - Required roles vs user role:', requiredRoles, user.role);
    console.log('DEBUG RolesGuard - User has required role:', hasRole);
    
    return hasRole;
  }
}
