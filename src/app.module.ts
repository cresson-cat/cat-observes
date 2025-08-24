import { Module } from '@nestjs/common';
import { CatInAmbushModule } from './cat-in-ambush/cat-in-ambush.module';
import { ConfigModule } from '@nestjs/config';
import { CatAlarmClockModule } from './cat-alarm-clock/cat-alarm-clock.module';
import { FirestoreModule } from './firestore/firestore.module';
import { CatWarningModule } from './cat-warning/cat-warning.module';
import { SlackModule } from './slack/slack.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    CatInAmbushModule,
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? ['.env', '.env.dev', '.env.dev.secret']
          : ['.env'],
      ignoreEnvFile: process.env.NODE_ENV !== 'development', // development 環境以外では .env ファイルを無視（環境変数優先）
      isGlobal: true,
    }),
    CatAlarmClockModule,
    FirestoreModule,
    CatWarningModule,
    SlackModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
