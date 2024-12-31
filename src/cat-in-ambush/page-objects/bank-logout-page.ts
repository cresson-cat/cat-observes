import { Injectable } from '@nestjs/common';
import { type Page } from 'playwright';

/**
 * Page Object Model - ログアウト画面
 */
@Injectable()
export class BankLogoutPage {
  async logout(page: Page) {
    await page.getByRole('link', { name: 'ログアウト' }).click();
  }
}
