import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constans';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: string; email: string; rol: string; tallerId: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
      tallerId: payload.tallerId,
    };
  }
}
