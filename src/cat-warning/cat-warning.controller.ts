import { Controller, Post } from '@nestjs/common';
import { CatWarningService } from './cat-warning.service';

@Controller('cat-warning')
export class CatWarningController {
  constructor(private readonly catWarningService: CatWarningService) {}

  @Post()
  public async meows() {
    await this.catWarningService.sendSlackNotification();
  }
}
