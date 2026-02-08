import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ description: 'UUID del taller al que pertenece el cliente' })
  @IsUUID('4', { message: 'tallerId debe ser un UUID válido' })
  tallerId: string;

  @ApiProperty({ description: 'Nombre del cliente', example: 'María Rodríguez' })
  @IsString()
  @MinLength(1, { message: 'nombre no puede estar vacío' })
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '809-555-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'maria@empresa.com' })
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
