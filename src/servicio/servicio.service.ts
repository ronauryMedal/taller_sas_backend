import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicioDto, UpdateServicioDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

const servicioSelect = {
  id: true,
  tallerId: true,
  codigo: true,
  nombre: true,
  precio: true,
  descripcion: true,
  activo: true,
  createdAt: true,
  taller: { select: { id: true, nombre: true } },
} as const;

/** Palabras que se omiten al generar el prefijo del código (artículos, preposiciones). */
const STOP_WORDS = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'del', 'los', 'las', 'un', 'una']);

/**
 * Genera el prefijo del código a partir del nombre (ej: "Rectificación de culata" -> "REC-CUL").
 * Toma las primeras 3 letras de las dos primeras palabras significativas, en mayúsculas.
 */
function prefijoDesdeNombre(nombre: string): string {
  const palabras = nombre
    .trim()
    .split(/\s+/)
    .filter((p) => p.length >= 2 && !STOP_WORDS.has(p.toLowerCase()));
  if (palabras.length === 0) return 'SRV';
  if (palabras.length === 1) {
    const p = palabras[0];
    return `${p.slice(0, 3).toUpperCase()}-${(p.slice(3, 6) || p.slice(0, 3)).toUpperCase()}`;
  }
  const [a, b] = palabras;
  return `${a.slice(0, 3).toUpperCase()}-${b.slice(0, 3).toUpperCase()}`;
}

@Injectable()
export class ServicioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServicioDto: CreateServicioDto) {
    const { tallerId, nombre, precio, descripcion } = createServicioDto;
    const prefijo = prefijoDesdeNombre(nombre);

    const existentes = await this.prisma.servicio.findMany({
      where: { tallerId, codigo: { startsWith: `${prefijo}-` } },
      select: { codigo: true },
    });
    const numeros = existentes
      .map((s) => parseInt(s.codigo.split('-').pop() ?? '0', 10))
      .filter((n) => !Number.isNaN(n));
    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
    const codigo = `${prefijo}-${String(siguiente).padStart(2, '0')}`;

    try {
      return await this.prisma.servicio.create({
        data: {
          tallerId,
          codigo,
          nombre,
          precio,
          descripcion,
          activo: true,
        },
        select: servicioSelect,
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al crear el servicio');
    }
  }

  async findAll(tallerId?: string, soloActivos = true) {
    try {
      return await this.prisma.servicio.findMany({
      where: {
        ...(tallerId ? { tallerId } : {}),
        ...(soloActivos ? { activo: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: servicioSelect,
    });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al listar los servicios');
    }
  }

  async findOne(id: string) {
    try {
      const servicio = await this.prisma.servicio.findUnique({
      where: { id },
      select: servicioSelect,
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al obtener el servicio');
    }
  }

  async update(id: string, updateServicioDto: UpdateServicioDto) {
    await this.findOne(id);
    try {
      return await this.prisma.servicio.update({
      where: { id },
      data: updateServicioDto,
      select: servicioSelect,
    });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al actualizar el servicio');
    }
  }

  /** Soft delete: marca el servicio como inactivo (activo = false). */
  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.servicio.update({
      where: { id },
      data: { activo: false },
      select: servicioSelect,
    });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al eliminar el servicio');
    }
  }
}
