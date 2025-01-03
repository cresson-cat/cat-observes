import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { isValidationErrors } from 'src/functions/common';
import { CatFoodDto } from 'src/models/dto/cat-food.model.dto';
import { Browser, BrowserContext, type Page, chromium } from 'playwright';
import { BankLoginPage } from './page-objects/bank-login-page';
import { BankStatementPage } from './page-objects/bank-statement-page';
import { BankLogoutPage } from './page-objects/bank-logout-page';
import { BankDownloadPage } from './page-objects/bank-download-page';

@Injectable()
export class CatInAmbushService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly loginPage: BankLoginPage,
    private readonly statementPage: BankStatementPage,
    private readonly downloadPage: BankDownloadPage,
    private readonly logoutPage: BankLogoutPage,
  ) {}

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  public async ambush() {
    const config = (() => {
      const num = Number;
      const canDebugBrowser = num.parseInt(this.configService.get('HEADLESS'));
      return {
        beforeParthing: this.configService.get<string>('TARGETS'),
        downloadPath: this.configService.get<string>('DOWNLOAD_PATH'),
        headless: num.isNaN(canDebugBrowser) ? true : !!canDebugBrowser,
      };
    })();
    const targets = await this.setup(config.beforeParthing);

    this.browser = await chromium.launch({
      downloadsPath: config.downloadPath,
      headless: config.headless,
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.page.context().setDefaultTimeout(60000);

    const result = [];
    try {
      for (const target of targets) {
        const name = `${await this.execute(target, config.downloadPath)}`;
        if (name) result.push(name);
      }
    } finally {
      await Promise.all([
        this.page?.close(),
        this.context?.close(),
        this.browser?.close(),
      ]);
    }

    return result;
  }

  private setup = async (beforeParthing: string) => {
    const targets: CatFoodDto[] = JSON.parse(beforeParthing)
      .filter((p) => !!p)
      .map((t) => plainToClass(CatFoodDto, t));

    const errors = await validate(targets);

    if (isValidationErrors(errors)) {
      console.log(
        'Caught promise rejection (validation failed). Errors: ',
        errors,
      );
      return [];
    }

    return targets;
  };

  private execute = async (target: CatFoodDto, downloadPath: string) => {
    if (!this.page) throw new Error('Page is not initialized');

    const afterLogin = await this.loginPage.navigateToLogin(this.page);
    await this.loginPage.login(afterLogin, target);
    await this.statementPage.navigateToStatementDownload(afterLogin, target);

    const result = await this.downloadPage.downloadStatement(
      afterLogin,
      downloadPath,
    );
    await this.logoutPage.logout(afterLogin);

    return result;
  };
}
