import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas exigiendo JWT válido.
 * Añade req.user con los datos devueltos por JwtStrategy.validate().
 * Uso: @UseGuards(JwtAuthGuard) o @UseGuards(JwtAuthGuard, RolesGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
