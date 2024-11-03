import { Test, TestingModule } from '@nestjs/testing';
import { CatInAmbushController } from '../cat-in-ambush.controller';

describe('CatInAmbushController', () => {
  let controller: CatInAmbushController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatInAmbushController],
    }).compile();

    controller = module.get<CatInAmbushController>(CatInAmbushController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
