import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './authDtos';

@Injectable()
export class AuthService {

constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

    async login(loginDto: LoginDto) {
        const user = await this.prisma.usuario.findUnique({
            where: { email: loginDto.email },
        });
        if (!user || user.password !== loginDto.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            rol: user.rol,
            tallerId: user.tallerId,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

}
