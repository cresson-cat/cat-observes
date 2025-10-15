import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'ヘルスチェックエンドポイント' })
  @ApiResponse({
    status: 200,
    description: 'アプリケーションが正常に動作している',
  })
  getHealth(): string {
    return 'OK';
  }
}
