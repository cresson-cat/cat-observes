import { Test, TestingModule } from '@nestjs/testing';
import { UsageHistoryRepository } from './usage-history.repository';

describe('UsageHistoryRepository', () => {
  let service: UsageHistoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsageHistoryRepository],
    }).compile();

    service = module.get<UsageHistoryRepository>(UsageHistoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
