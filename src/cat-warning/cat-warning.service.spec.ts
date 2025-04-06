import { Test, TestingModule } from '@nestjs/testing';
import { CatWarningService } from './cat-warning.service';

describe('CatWarningService', () => {
  let service: CatWarningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatWarningService],
    }).compile();

    service = module.get<CatWarningService>(CatWarningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
