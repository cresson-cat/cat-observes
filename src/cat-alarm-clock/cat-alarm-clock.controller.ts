import { Body, Controller, Post } from '@nestjs/common';
import { CatAlarmClockService } from './cat-alarm-clock.service';
import type { AlarmClockDto } from 'src/models/dto/alarm-clock.model.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('alarm-clock')
@ApiTags('alarm-clock') // コントローラーにタグを追加
export class CatAlarmClockController {
  constructor(private service: CatAlarmClockService) {}

  @Post()
  // @note レスポンスの例
  @ApiOperation({ summary: '銀行の取引明細を取り込む' })
  @ApiResponse({ status: 201, description: '成功' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  public wakeUp(@Body() request: AlarmClockDto) {
    return this.service.wakeUp(request.files);
  }
}
