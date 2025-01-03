import { Module } from '@nestjs/common';
import { CatInAmbushModule } from './cat-in-ambush/cat-in-ambush.module';
import { ConfigModule } from '@nestjs/config';
import { CatAlarmClockModule } from './cat-alarm-clock/cat-alarm-clock.module';
import { FirestoreModule } from './firestore/firestore.module';

@Module({
  imports: [
    CatInAmbushModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local'],
    }),
    CatAlarmClockModule,
    FirestoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
