import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const usuarioSinPassword = {
  id: true,
  tallerId: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
  taller: { select: { id: true, nombre: true } },
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tallerId?: string) {
    return this.prisma.usuario.findMany({
      where: tallerId ? { tallerId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: usuarioSinPassword,
    });
  }

  async findOne(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioSinPassword,
    });
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.prisma.usuario.create({
      data: createUsuarioDto,
      select: usuarioSinPassword,
    });
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      select: usuarioSinPassword,
    });
  }

  async remove(id: string) {
    return this.prisma.usuario.delete({
      where: { id },
      select: usuarioSinPassword,
    });
  }
}
