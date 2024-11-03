import { Test, TestingModule } from '@nestjs/testing';
import { CatInAmbushService } from '../cat-in-ambush.service';

describe('CatInAmbushService', () => {
  let service: CatInAmbushService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatInAmbushService],
    }).compile();

    service = module.get<CatInAmbushService>(CatInAmbushService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
