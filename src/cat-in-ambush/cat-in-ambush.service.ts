import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
import { plainToClass, plainToInstance } from 'class-transformer';
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
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  public async ambush(): Promise<string[]> {
    const config = (() => {
      const canDebugBrowser = parseInt(this.configService.get('HEADLESS'));
      return {
        beforeParthing: this.configService
          .get<string>('TARGETS')
          .replace(/^'(.*)'$/, '$1'), // 先頭と末尾のシングルクォートを削除
        downloadPath: this.configService.get<string>('DOWNLOAD_PATH'),
        headless: isNaN(canDebugBrowser) ? true : !!canDebugBrowser,
      };
    })();
    // console.log(config);
    const targets = await this.setup(config.beforeParthing);

    this.browser = await chromium.launch({
      downloadsPath: config.downloadPath,
      headless: config.headless ?? true, // デフォルトでヘッドレスモードを有効にする
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.page.context().setDefaultTimeout(180000);

    const result: string[] = [];
    try {
      for (const target of targets) {
        const name = `${await this.execute(target, config.downloadPath)}`;
        if (name) result.push(name);
      }
    } catch (error) {
      console.error('Error during ambush execution:', error);

      // Firestore関連のエラーを特定するための追加ログ
      if (error.code === 7) {
        console.error(
          'Permission denied. Check Firestore credentials and permissions.',
        );
      }

      throw error; // エラーを再スローして呼び出し元に通知
    } finally {
      await this.onModuleDestroy(); // リソース管理を統一
    }

    return result;
  }

  private setup = async (beforeParthing: string) => {
    const parsedData = JSON.parse(beforeParthing);
    if (!Array.isArray(parsedData)) {
      throw new Error('Invalid data format: Expected an array');
    }

    const targets: CatFoodDto[] = parsedData
      .filter((p) => !!p)
      .map((t) => plainToInstance(CatFoodDto, t));

    const errors = await Promise.all(targets.map((target) => validate(target)));
    const flattenedErrors = errors.flat();

    if (isValidationErrors(flattenedErrors)) {
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
