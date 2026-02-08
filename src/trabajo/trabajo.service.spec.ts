import { Test, TestingModule } from '@nestjs/testing';
import { TrabajoService } from './trabajo.service';

describe('TrabajoService', () => {
  let service: TrabajoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrabajoService],
    }).compile();

    service = module.get<TrabajoService>(TrabajoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
