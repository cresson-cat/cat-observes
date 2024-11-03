import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { isValidationErrors } from 'src/functions/common';
import { Target } from 'src/models/target.model';
import { type Page, chromium } from 'playwright';
import path from 'node:path/posix';

@Injectable()
export class CatInAmbushService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * メイン処理
   */
  public async ambush() {
    // .env 読み込み
    const config = (() => {
      const num = Number;
      const canDebugBrowser = num.parseInt(this.configService.get('HEADLESS'));
      return {
        beforeParthing: this.configService.get<string>('TARGETS'),
        downloadPath: this.configService.get<string>('DOWNLOAD_PATH'),
        // NaN: headless
        headless: num.isNaN(canDebugBrowser) ? true : !!canDebugBrowser,
      };
    })();
    const targets = await this.setup(config.beforeParthing);

    // chromium 起動
    const browser = await chromium.launch({
      downloadsPath: config.downloadPath,
      headless: config.headless,
    });
    const page = await browser.newPage();
    page.context().setDefaultTimeout(60000);

    // アカウント毎に実行 @todo: Promise.all にする
    try {
      for (const target of targets) {
        await this.execute(page, target, config.downloadPath);
      }
    } finally {
      page.close();
      browser.close();
    }
  }
  /**
   * 実行前の準備
   *
   * @param beforeParthing
   * @returns パース済のダウンロード対象
   */
  private setup = async (beforeParthing: string) => {
    const targets: Target[] = JSON.parse(beforeParthing)
      .filter((p) => !!p)
      .map((t) => plainToClass(Target, t));

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
  /**
   * 実行
   *
   * @param page
   * @param target
   * @param downloadPath
   * @returns playwright.test の第二引数
   */
  private execute = async (
    page: Page,
    target: Target,
    downloadPath: string,
  ) => {
    // 対象の画面に遷移
    await page.goto('https://www.bk.mufg.jp/index.html');
    const pagePromise = page.waitForEvent('popup');

    // ログインページへ遷移
    await page
      .getByRole('link', {
        name: '個人向けインターネットバンキング ログイン 三菱ＵＦＪダイレクト',
      })
      .click();
    const afterLogin = await pagePromise;

    // ログイン
    await this.login(afterLogin, target);

    // 明細ダウンロードページへ遷移
    await afterLogin
      .getByRole('link', {
        name: `ご契約番号 ${target.contractNum} ${target.branchName}支店 普通`,
      })
      .click();

    // ダウンロード
    await this.download(afterLogin, downloadPath);

    // ログアウト
    await this.logout(afterLogin);
  };
  /**
   * ログイン
   *
   * @param page
   * @param target
   * @description 契約番号／パスワード 入力
   */
  private login = async (page: Page, target: Target) => {
    await page.getByPlaceholder('半角数字', { exact: true }).click();
    await page
      .getByPlaceholder('半角数字', { exact: true })
      .fill(`${target.contractNum}`);
    await page.getByPlaceholder('半角英数字・記号 4～16桁').click();
    await page
      .getByPlaceholder('半角英数字・記号 4～16桁')
      .fill(target.password);
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  };
  /**
   * ダウンロード
   *
   * @param page
   * @param downloadPath
   */
  private download = async (page: Page, downloadPath: string) => {
    try {
      // ページ遷移を待つ
      await page.waitForURL('**/RY_0003_PC01');

      // 明細ダウンロードページへ遷移
      await page.getByRole('link', { name: '明細ダウンロード' }).click();
      await page.waitForURL('**/RY_0003_PC02');

      // 絞り込み用のラジオボタン設定
      await page.getByLabel('最近10日間').check();

      // ファイルを保存ダイアログ表示
      page.once('dialog', (dialog) => dialog.accept().catch(() => {}));

      const downloadPromise = page.waitForEvent('download');
      await page
        .getByRole('button', { name: 'ダウンロード（CSV形式）' })
        .click();

      /* ダイアログが閉じるまで待つ (必要に応じて)
       * await page.waitForTimeout(500); */

      // ファイルを保存
      const download = await downloadPromise;
      /* 恐らく node:path/posix が正しい
       * （多分、インストールしている node と型定義が合っていない） */
      // path.join(downloadPath, download.suggestedFilename()),
      const fileName = `${downloadPath}/${download.suggestedFilename()}`;
      await download.saveAs(fileName);

      return fileName;
    } catch (e) {
      // throw errorForRethrow('ダウンロードに失敗しました', e);
      console.dir(e);
    }
  };
  /**
   * ログアウト
   *
   * @param page
   */
  private logout = async (page: Page) => {
    await page.getByRole('link', { name: 'ログアウト' }).click();
  };
}
