import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

/** Select/include para obtener una factura con todo lo necesario para el PDF */
const facturaParaPdfInclude = {
  taller: {
    select: {
      id: true,
      nombre: true,
      rnc: true,
      telefono: true,
      email: true,
      direccion: true,
    },
  },
  trabajo: {
    select: {
      id: true,
      codigoTrabajo: true,
      descripcionPieza: true,
      cliente: {
        select: {
          id: true,
          nombre: true,
          telefono: true,
          email: true,
          empresa: true,
        },
      },
      serviciosEnTrabajo: {
        where: { deletedAt: null },
        select: {
          id: true,
          cantidad: true,
          precioUnitario: true,
          subtotal: true,
          servicio: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              precio: true,
            },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class FacturasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFacturaDto: CreateFacturaDto) {
    const { trabajoId, tallerId, numeroFactura, subtotal, impuestos, total, fechaEmision } =
      createFacturaDto;
    return this.prisma.factura.create({
      data: {
        trabajoId,
        tallerId,
        numeroFactura,
        subtotal,
        impuestos,
        total,
        fechaEmision: fechaEmision ? new Date(fechaEmision) : new Date(),
      },
      include: {
        taller: { select: { id: true, nombre: true } },
        trabajo: { select: { id: true, codigoTrabajo: true } },
      },
    });
  }

  findAll(tallerId?: string) {
    return this.prisma.factura.findMany({
      where: tallerId ? { tallerId } : undefined,
      orderBy: { fechaEmision: 'desc' },
      include: {
        taller: { select: { id: true, nombre: true } },
        trabajo: { select: { id: true, codigoTrabajo: true } },
      },
    });
  }

  /**
   * Obtiene una factura por ID con todos los datos necesarios para generar el PDF:
   * taller (datos fiscales), trabajo, cliente, servicios del trabajo.
   * Lanza NotFoundException si no existe.
   */
  async findOneForPdf(id: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: facturaParaPdfInclude,
    });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    return factura;
  }

  async findOne(id: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: {
        taller: { select: { id: true, nombre: true } },
        trabajo: { select: { id: true, codigoTrabajo: true, descripcionPieza: true } },
      },
    });
    if (!factura) throw new NotFoundException('Factura no encontrada');
    return factura;
  }

  update(id: string, updateFacturaDto: UpdateFacturaDto) {
    return `This action updates a #${id} factura`;
  }

  remove(id: string) {
    return `This action removes a #${id} factura`;
  }
}
