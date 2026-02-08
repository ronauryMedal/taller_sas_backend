import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateFacturaDto {
  @ApiProperty({ description: 'UUID del trabajo facturado' })
  @IsUUID('4', { message: 'trabajoId debe ser un UUID válido' })
  trabajoId: string;

  @ApiProperty({ description: 'UUID del taller' })
  @IsUUID('4', { message: 'tallerId debe ser un UUID válido' })
  tallerId: string;

  @ApiProperty({ description: 'Número de factura', example: 'F-2025-0001' })
  @IsString()
  numeroFactura: string;

  @ApiProperty({ description: 'Subtotal', example: 3000 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ description: 'Impuestos', example: 450 })
  @IsNumber()
  @Min(0)
  impuestos: number;

  @ApiProperty({ description: 'Total', example: 3450 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ description: 'Fecha de emisión (ISO); si no se envía, se usa la fecha actual' })
  @IsOptional()
  @IsString()
  fechaEmision?: string;
}
