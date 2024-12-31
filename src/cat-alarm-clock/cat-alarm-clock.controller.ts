import { Body, Controller, Post } from '@nestjs/common';
import { CatAlarmClockService } from './cat-alarm-clock.service';
import type { AlarmClockDto } from 'src/models/dto/alarm-clock.model.dto';

@Controller('alarm-clock')
export class CatAlarmClockController {
  constructor(private service: CatAlarmClockService) {}
  @Post()
  public wakeUp(@Body() request: AlarmClockDto) {
    return this.service.wakeUp(request.files);
  }
}
