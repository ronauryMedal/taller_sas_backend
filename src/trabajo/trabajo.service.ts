import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoTrabajo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';

@Injectable()
export class TrabajoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrabajoDto: CreateTrabajoDto) {
    const { servicios, ...trabajoData } = createTrabajoDto;

    return this.prisma.$transaction(async (tx) => {
      const cantidad = await tx.trabajo.count({ where: { tallerId: trabajoData.tallerId } });
      const codigoTrabajo = `TRAB-${String(cantidad + 1).padStart(4, '0')}`;

      const data = {
        ...trabajoData,
        codigoTrabajo,
        estado: EstadoTrabajo.PENDIENTE,
        ...(createTrabajoDto.fechaInicio && {
          fechaInicio: new Date(createTrabajoDto.fechaInicio),
        }),
        ...(createTrabajoDto.fechaFinal && {
          fechaFinal: new Date(createTrabajoDto.fechaFinal),
        }),
      };

      const trabajo = await tx.trabajo.create({ data });

      if (servicios?.length) {
        await tx.trabajoServicio.createMany({
          data: servicios.map((s) => ({
            trabajoId: trabajo.id,
            servicioId: s.servicioId,
            cantidad: s.cantidad ?? 1,
            precioUnitario: s.precioUnitario,
            subtotal: s.subtotal,
          })),
        });
      }

      return tx.trabajo.findUnique({
        where: { id: trabajo.id },
        include: { serviciosEnTrabajo: { include: { servicio: true } } },
      });
    });
  }

  async findAll() {
    return this.prisma.trabajo.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: true,
        empleado: true,
        taller: { select: { id: true, nombre: true } },
        serviciosEnTrabajo: { include: { servicio: true } },
      },
    });
  }

  async findOne(id: string) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id },
      include: {
        cliente: true,
        empleado: true,
        taller: { select: { id: true, nombre: true } },
        serviciosEnTrabajo: { include: { servicio: true } },
      },
    });
    if (!trabajo) throw new NotFoundException(`Trabajo con id ${id} no encontrado`);
    return trabajo;
  }

  async update(id: string, updateTrabajoDto: UpdateTrabajoDto) {
    await this.findOne(id);
    const { servicios, ...rest } = updateTrabajoDto;
    const data: Record<string, unknown> = { ...rest };
    if (rest.fechaInicio) data.fechaInicio = new Date(rest.fechaInicio);
    if (rest.fechaFinal) data.fechaFinal = new Date(rest.fechaFinal);
    return this.prisma.trabajo.update({
      where: { id },
      data,
      include: {
        cliente: true,
        empleado: true,
        serviciosEnTrabajo: { include: { servicio: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.trabajo.delete({ where: { id } });
  }
}
