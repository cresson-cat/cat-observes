// biome-ignore lint/style/useImportType: <explanation>
import { Test, TestingModule } from '@nestjs/testing';
import { CatAlarmClockService } from '../cat-alarm-clock.service';

describe('CatAlarmClockService', () => {
  let service: CatAlarmClockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatAlarmClockService],
    }).compile();

    service = module.get<CatAlarmClockService>(CatAlarmClockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
