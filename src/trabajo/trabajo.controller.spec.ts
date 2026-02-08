import { Test, TestingModule } from '@nestjs/testing';
import { TrabajoController } from './trabajo.controller';
import { TrabajoService } from './trabajo.service';

describe('TrabajoController', () => {
  let controller: TrabajoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrabajoController],
      providers: [TrabajoService],
    }).compile();

    controller = module.get<TrabajoController>(TrabajoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
