import { SetMetadata } from '@nestjs/common';
import { Rol } from './roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Marca una ruta o controlador con los roles que pueden acceder.
 * Uso: @Roles(Rol.ADMIN) o @Roles(Rol.ADMIN, Rol.EMPLEADO)
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
