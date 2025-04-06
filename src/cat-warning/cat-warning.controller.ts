import { Controller, Post } from '@nestjs/common';
import { CatWarningService } from './cat-warning.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('cat-warning') // Swagger UI でのグルーピングのためのタグを追加
@Controller('cat-warning')
export class CatWarningController {
  constructor(private readonly catWarningService: CatWarningService) {}

  @Post()
  @ApiOperation({ summary: '残高がしきい値を下回っていた場合通知する' })
  @ApiResponse({ status: 201, description: '成功' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async meows() {
    await this.catWarningService.sendSlackNotification();
  }
}
