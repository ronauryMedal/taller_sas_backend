import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpleadoDto {
  @ApiProperty({ description: 'UUID del taller al que pertenece el empleado' })
  tallerId: string;

  @ApiPropertyOptional({
    description: 'UUID del usuario vinculado (opcional: un usuario puede ser empleado)',
  })
  usuarioId?: string;

  @ApiProperty({ description: 'Nombre del empleado', example: 'Carlos López' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '809-555-1234' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Porcentaje de comisión (decimal, ej. 10.50)',
    example: 10.5,
    default: 0,
  })
  porcentajeComision?: number;

  @ApiPropertyOptional({ description: 'Si el empleado está activo', default: true })
  activo?: boolean;
}
