import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Item de servicio a aplicar en el trabajo (tabla TrabajoServicio) */
export class ServicioEnTrabajoDto {
  @ApiProperty({ description: 'ID del servicio del catálogo' })
  @IsUUID()
  servicioId: string;

  @ApiPropertyOptional({ description: 'Cantidad', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  cantidad?: number;

  @ApiPropertyOptional({ description: 'Precio unitario en el momento del trabajo (opcional; si no se envía, usar el del catálogo)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;

  @ApiPropertyOptional({ description: 'Subtotal del servicio en el trabajo (opcional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
}

export class CreateTrabajoDto {
  @ApiProperty({ description: 'ID del taller' })
  @IsUUID()
  tallerId: string;

  @ApiProperty({ description: 'ID del cliente' })
  @IsUUID()
  clienteId: string;

  @ApiPropertyOptional({ description: 'ID del empleado asignado' })
  @IsOptional()
  @IsUUID()
  empleadoId?: string;

  @ApiProperty({ description: 'Descripción de la pieza' })
  @IsString()
  @MinLength(1)
  descripcionPieza: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio del trabajo (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de finalización (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fechaFinal?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    type: [ServicioEnTrabajoDto],
    description: 'Servicios a aplicar en este trabajo (TrabajoServicio)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicioEnTrabajoDto)
  servicios?: ServicioEnTrabajoDto[];
}
