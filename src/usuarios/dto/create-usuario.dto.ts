import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RolEnum {
  ADMIN = 'ADMIN',
  EMPLEADO = 'EMPLEADO',
}

export class CreateUsuarioDto {
  @ApiProperty({ description: 'UUID del taller al que pertenece el usuario' })
  tallerId: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  nombre: string;

  @ApiProperty({ description: 'Email (único por taller)', example: 'juan@taller.com' })
  email: string;

  @ApiProperty({ description: 'Contraseña', example: '********', minLength: 6 })
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: RolEnum,
    default: RolEnum.EMPLEADO,
  })
  rol?: RolEnum;

  @ApiPropertyOptional({ description: 'Si el usuario está activo', default: true })
  activo?: boolean;
}
