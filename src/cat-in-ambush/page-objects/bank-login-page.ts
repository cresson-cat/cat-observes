import { Injectable } from '@nestjs/common';
import { CatFoodDto } from 'src/models/dto/cat-food.model.dto';
import { type Page, type Response } from 'playwright';

/**
 * Page Object Model - ログイン画面
 */
@Injectable()
export class BankLoginPage {
  async navigateToLogin(preLoginPage: Page) {
    await preLoginPage.goto('https://www.bk.mufg.jp/index.html', { waitUntil: 'domcontentloaded' });
    const pagePromise = preLoginPage.waitForEvent('popup');
    await preLoginPage
      .getByRole('link', {
        name: '個人向けインターネットバンキング ログイン 三菱ＵＦＪダイレクト',
      })
      .click();
    return await pagePromise;
  }

  async login(afterLoginPage: Page, target: CatFoodDto) {
    await afterLoginPage
      .getByPlaceholder('半角数字', { exact: true })
      .fill(`${target.contractNum}`);

    await afterLoginPage
      .getByPlaceholder('半角英数字・記号 4～16桁')
      .fill(target.password);

    await afterLoginPage
      .getByRole('button', { name: 'ログイン', exact: true })
      .click();
  }
}
