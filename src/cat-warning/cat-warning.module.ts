import { Module } from '@nestjs/common';
import { CatWarningController } from './cat-warning.controller';
import { CatWarningService } from './cat-warning.service';
import { FirestoreModule } from 'src/firestore/firestore.module';
import { SlackModule } from 'src/slack/slack.module';

@Module({
  imports: [FirestoreModule, SlackModule],
  controllers: [CatWarningController],
  providers: [CatWarningService],
})
export class CatWarningModule {}
