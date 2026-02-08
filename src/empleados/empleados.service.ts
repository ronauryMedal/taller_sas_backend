import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

const empleadoSelect = {
  id: true,
  tallerId: true,
  usuarioId: true,
  nombre: true,
  telefono: true,
  porcentajeComision: true,
  activo: true,
  createdAt: true,
  taller: { select: { id: true, nombre: true } },
  usuario: {
    select: { id: true, nombre: true, email: true },
  },
} as const;

@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tallerId?: string) {
    return this.prisma.empleado.findMany({
      where: tallerId ? { tallerId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: empleadoSelect,
    });
  }

  async findOne(id: string) {
    return this.prisma.empleado.findUnique({
      where: { id },
      select: empleadoSelect,
    });
  }

  async create(createEmpleadoDto: CreateEmpleadoDto) {
    return this.prisma.empleado.create({
      data: createEmpleadoDto,
      select: empleadoSelect,
    });
  }

  async update(id: string, updateEmpleadoDto: UpdateEmpleadoDto) {
    return this.prisma.empleado.update({
      where: { id },
      data: updateEmpleadoDto,
      select: empleadoSelect,
    });
  }

  async remove(id: string) {
    return this.prisma.empleado.delete({
      where: { id },
      select: empleadoSelect,
    });
  }
}
