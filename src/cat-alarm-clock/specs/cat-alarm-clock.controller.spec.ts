// biome-ignore lint/style/useImportType: <explanation>
import { Test, TestingModule } from '@nestjs/testing';
import { CatAlarmClockController } from '../cat-alarm-clock.controller';

describe('CatAlarmClockController', () => {
  let controller: CatAlarmClockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatAlarmClockController],
    }).compile();

    controller = module.get<CatAlarmClockController>(CatAlarmClockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
