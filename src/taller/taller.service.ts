import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';

@Injectable()
export class TallerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.taller.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.taller.findUnique({
      where: { id },
    });
  }

  async create(createTallerDto: CreateTallerDto) {
    return this.prisma.taller.create({ data: createTallerDto });
  }

  async update(id: string, updateTallerDto: UpdateTallerDto) {
    return this.prisma.taller.update({
      where: { id },
      data: updateTallerDto,
    });
  }

  async remove(id: string) {
    return this.prisma.taller.delete({
      where: { id },
    });
  }
}
