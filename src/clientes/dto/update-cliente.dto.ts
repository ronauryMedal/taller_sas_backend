import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';

export class UpdateClienteDto {
  @ApiPropertyOptional({ description: 'Nombre del cliente' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'nombre no puede estar vacío' })
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail({}, { message: 'email debe ser un correo válido' })
  email?: string;

  @ApiPropertyOptional({ description: 'Nombre de la empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  empresa?: string;

  @ApiPropertyOptional({ description: 'Notas (texto libre)' })
  @IsOptional()
  @IsString()
  notas?: string;
}
