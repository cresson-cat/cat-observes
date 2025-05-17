import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // @note swagger 設定
  const config = new DocumentBuilder()
    .setTitle('Cat Observables')
    .setDescription('The cat API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000; // 環境変数からポートを取得
  await app.listen(port);
}
bootstrap();
