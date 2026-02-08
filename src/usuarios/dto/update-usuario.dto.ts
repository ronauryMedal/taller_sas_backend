import { ApiPropertyOptional } from '@nestjs/swagger';
import { RolEnum } from './create-usuario.dto';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  nombre?: string;

  @ApiPropertyOptional({ description: 'Email (único por taller)' })
  email?: string;

  @ApiPropertyOptional({ description: 'Nueva contraseña' })
  password?: string;

  @ApiPropertyOptional({ description: 'Rol del usuario', enum: RolEnum })
  rol?: RolEnum;

  @ApiPropertyOptional({ description: 'Si el usuario está activo' })
  activo?: boolean;
}
