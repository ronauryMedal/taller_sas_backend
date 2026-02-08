import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TallerController } from './taller.controller';
import { TallerService } from './taller.service';

@Module({
  imports: [AuthModule],
  controllers: [TallerController],
  providers: [TallerService],
})
export class TallerModule {}
