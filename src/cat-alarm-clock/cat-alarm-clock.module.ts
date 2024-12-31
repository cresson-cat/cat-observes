import { Module } from '@nestjs/common';
import { CatAlarmClockController } from './cat-alarm-clock.controller';
import { CatAlarmClockService } from './cat-alarm-clock.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CatAlarmClockController],
  providers: [CatAlarmClockService, ConfigService],
})
export class CatAlarmClockModule {}
