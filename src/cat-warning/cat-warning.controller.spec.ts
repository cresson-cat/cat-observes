import { Test, TestingModule } from '@nestjs/testing';
import { CatWarningController } from './cat-warning.controller';

describe('CatWarningController', () => {
  let controller: CatWarningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatWarningController],
    }).compile();

    controller = module.get<CatWarningController>(CatWarningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
