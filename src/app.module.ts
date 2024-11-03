import { Module } from '@nestjs/common';
import { CatInAmbushModule } from './cat-in-ambush/cat-in-ambush.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CatInAmbushModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
