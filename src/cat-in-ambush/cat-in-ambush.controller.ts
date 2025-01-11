// src/cat-in-ambush/cat-in-ambush.controller.ts
import { Controller, Post } from '@nestjs/common';
import { CatInAmbushService } from './cat-in-ambush.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('ambush')
@ApiTags('ambush') // コントローラーにタグを追加
export class CatInAmbushController {
  constructor(private service: CatInAmbushService) {}

  @Post()
  @ApiOperation({ summary: '銀行の取引明細を取得' })
  @ApiResponse({ status: 200, description: '成功', type: [String] }) // レスポンスの型を指定
  public async ambush() {
    return await this.service.ambush();
  }
}
