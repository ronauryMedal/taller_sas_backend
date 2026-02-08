/**
 * Roles del sistema (debe coincidir con el enum Rol en prisma/schema.prisma).
 */
export enum Rol {
  ADMIN = 'ADMIN',
  EMPLEADO = 'EMPLEADO',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
