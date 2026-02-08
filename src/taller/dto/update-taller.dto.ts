import { PartialType } from '@nestjs/swagger';
import { CreateTallerDto } from './create-taller.dto';

/**
 * Todos los campos opcionales (para actualización parcial).
 * Hereda de CreateTallerDto con PartialType.
 */
export class UpdateTallerDto extends PartialType(CreateTallerDto) {}
