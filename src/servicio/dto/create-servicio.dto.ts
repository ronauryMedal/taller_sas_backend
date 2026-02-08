import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateServicioDto {
  @ApiProperty({ description: 'UUID del taller' })
  @IsUUID('4', { message: 'tallerId debe ser un UUID válido' })
  tallerId: string;

  @ApiProperty({ description: 'Nombre del servicio (el código se genera automáticamente a partir de este nombre)', example: 'Rectificación de culata' })
  @IsString()
  @MinLength(1, { message: 'nombre no puede estar vacío' })
  @MaxLength(200)
  nombre: string;

  @ApiProperty({ description: 'Precio del servicio', example: 3500 })
  @IsNumber()
  @Min(0, { message: 'precio debe ser mayor o igual a 0' })
  @Max(1000000, { message: 'precio debe ser menor que 1000000' })
  precio: number;

  @ApiPropertyOptional({ description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string;
}