import { Body, Controller, Post } from '@nestjs/common';
import { CatAlarmClockService } from './cat-alarm-clock.service';
import { AlarmClockDto } from 'src/models/dto/alarm-clock.model.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('alarm-clock')
@ApiTags('alarm-clock') // コントローラーにタグを追加
export class CatAlarmClockController {
  constructor(private service: CatAlarmClockService) {}

  @Post()
  @ApiOperation({ summary: '銀行の取引明細を取り込む' })
  @ApiBody({
    type: AlarmClockDto,
    description: 'アラームクロックのリクエスト',
    examples: {
      example1: {
        summary: 'ファイルが1つの例',
        value: {
          files: ['file1.txt'],
        },
      },
      example2: {
        summary: 'ファイルが複数の例',
        value: {
          files: ['file1.txt', 'file2.txt', 'file3.txt'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '成功' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  public wakeUp(@Body() request: AlarmClockDto) {
    return this.service.wakeUp(request.files);
  }
}
