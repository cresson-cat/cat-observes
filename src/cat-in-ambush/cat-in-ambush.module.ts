import { Module } from '@nestjs/common';
import { CatInAmbushController } from './cat-in-ambush.controller';
import { ConfigService } from '@nestjs/config';
import { CatInAmbushService } from './cat-in-ambush.service';

@Module({
  controllers: [CatInAmbushController],
  providers: [CatInAmbushService, ConfigService],
})
export class CatInAmbushModule {}
