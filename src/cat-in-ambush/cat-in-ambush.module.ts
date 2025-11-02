import { Module } from '@nestjs/common';
import { CatInAmbushController } from './cat-in-ambush.controller';
import { ConfigService } from '@nestjs/config';
import { CatInAmbushService } from './cat-in-ambush.service';
import { BankLoginPage } from './page-objects/bank-login-page';
import { BankStatementPage } from './page-objects/bank-statement-page';
import { BankDownloadPage } from './page-objects/bank-download-page';
import { BankLogoutPage } from './page-objects/bank-logout-page';
import { SlackModule } from 'src/slack/slack.module';

@Module({
  imports: [SlackModule],
  controllers: [CatInAmbushController],
  providers: [
    CatInAmbushService,
    ConfigService,
    BankLoginPage,
    BankStatementPage,
    BankDownloadPage,
    BankLogoutPage,
  ],
})
export class CatInAmbushModule {}
