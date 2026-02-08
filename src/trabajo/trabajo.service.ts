import { Injectable } from '@nestjs/common';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';

@Injectable()
export class TrabajoService {
  create(createTrabajoDto: CreateTrabajoDto) {
    return 'This action adds a new trabajo';
  }

  findAll() {
    return `This action returns all trabajo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trabajo`;
  }

  update(id: number, updateTrabajoDto: UpdateTrabajoDto) {
    return `This action updates a #${id} trabajo`;
  }

  remove(id: number) {
    return `This action removes a #${id} trabajo`;
  }
}
