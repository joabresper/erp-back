import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RolesService } from 'src/roles/roles.service';
import { type RequestWithUser } from 'src/auth/entities/req.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Leemos qué permisos pide la ruta
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    // 2. Obtenemos el usuario (Ya validado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user || !user.role) {
      throw new ForbiddenException('User not identified');
    }

    // Si el usuario es ADMIN, lo dejamos pasar SIEMPRE.
    if (user.role === 'ADMIN') {
      return true;
    }

    // 3. Si NO es Admin vamos a la BD a ver qué permisos tiene su rol
    const roleWithPermissions = await this.rolesService.findByName(
      user.role,
      true,
    );

    if (!roleWithPermissions) {
      throw new ForbiddenException('Role not found');
    }

    // 4. Verificamos coincidencia
    const userPermissions = roleWithPermissions.permissions.map((p) => p.name);

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
