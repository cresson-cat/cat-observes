import { Module } from '@nestjs/common';
import { CatInAmbushModule } from './cat-in-ambush/cat-in-ambush.module';
import { ConfigModule } from '@nestjs/config';
import { CatAlarmClockModule } from './cat-alarm-clock/cat-alarm-clock.module';
import { FirestoreModule } from './firestore/firestore.module';
import { CatWarningModule } from './cat-warning/cat-warning.module';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [
    CatInAmbushModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local'],
      isGlobal: true,
    }),
    CatAlarmClockModule,
    FirestoreModule,
    CatWarningModule,
    SlackModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
