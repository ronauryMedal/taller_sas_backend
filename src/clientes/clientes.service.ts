import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

const clienteSelect = {
  id: true,
  tallerId: true,
  nombre: true,
  telefono: true,
  email: true,
  empresa: true,
  notas: true,
  createdAt: true,
  taller: { select: { id: true, nombre: true } },
} as const;

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tallerId?: string) {
    return this.prisma.cliente.findMany({
      where: tallerId ? { tallerId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: clienteSelect,
    });
  }

  async findOne(id: string) {
    return this.prisma.cliente.findUnique({
      where: { id },
      select: clienteSelect,
    });
  }

  async create(createClienteDto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: createClienteDto,
      select: clienteSelect,
    });
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
      select: clienteSelect,
    });
  }

  async remove(id: string) {
    return this.prisma.cliente.delete({
      where: { id },
      select: clienteSelect,
    });
  }
}
