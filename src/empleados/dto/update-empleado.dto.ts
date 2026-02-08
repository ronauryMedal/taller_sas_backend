import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmpleadoDto {
  @ApiPropertyOptional({ description: 'UUID del usuario vinculado' })
  usuarioId?: string;

  @ApiPropertyOptional({ description: 'Nombre del empleado' })
  nombre?: string;

  @ApiPropertyOptional({ description: 'Teléfono' })
  telefono?: string;

  @ApiPropertyOptional({ description: 'Porcentaje de comisión (decimal)' })
  porcentajeComision?: number;

  @ApiPropertyOptional({ description: 'Si el empleado está activo' })
  activo?: boolean;
}
