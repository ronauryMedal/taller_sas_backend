import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTallerDto {
  @ApiProperty({ description: 'Nombre del taller', example: 'Taller García' })
  nombre: string;

  @ApiPropertyOptional({ description: 'RNC (opcional)', example: '1-31-12345-6' })
  rnc?: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '809-555-0000' })
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'contacto@tallergarcia.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Dirección física' })
  direccion?: string;

  @ApiPropertyOptional({ description: 'Si el taller está activo', default: true })
  activo?: boolean;
}
