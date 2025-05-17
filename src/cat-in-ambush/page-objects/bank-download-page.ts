import { Injectable } from '@nestjs/common';
// import { CatFoodDto } from 'src/models/dto/cat-food.model.dto';
import { type Page } from 'playwright';
import * as path from 'node:path';

/**
 * Page Object Model - 明細ダウンロード画面
 */
@Injectable()
export class BankDownloadPage {
  async downloadStatement(page: Page, downloadPath: string) {
    try {
      await page.waitForURL('**/RY_0003_PC01');
      await page.getByRole('link', { name: '明細ダウンロード' }).click();
      await page.waitForURL('**/RY_0003_PC02');
      await page.getByLabel('最近10日間').check();

      page.once('dialog', (dialog) => dialog.accept().catch(() => {}));

      const downloadPromise = page.waitForEvent('download');
      await page
        .getByRole('button', { name: 'ダウンロード（CSV形式）' })
        .click();

      const download = await downloadPromise;
      const fileName = path.join(downloadPath, download.suggestedFilename());      
      console.log(`Download started: ${fileName}`);

      await download.saveAs(fileName);

      return download.suggestedFilename();
    } catch (e) {
      console.dir(e);
    }
  }
}
