import { Module } from '@nestjs/common';
import { TrabajoService } from './trabajo.service';
import { TrabajoController } from './trabajo.controller';

@Module({
  controllers: [TrabajoController],
  providers: [TrabajoService],
})
export class TrabajoModule {}
