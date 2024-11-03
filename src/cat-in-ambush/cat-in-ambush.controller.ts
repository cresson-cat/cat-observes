import { Controller, Post } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { CatInAmbushService } from './cat-in-ambush.service';

@Controller('ambush')
export class CatInAmbushController {
  constructor(private service: CatInAmbushService) {}
  @Post()
  public async ambush() {
    return await this.service.ambush();
  }
}
