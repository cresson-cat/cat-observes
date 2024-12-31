import { Injectable } from '@nestjs/common';
import { CatFoodDto } from 'src/models/dto/cat-food.model.dto';
import { type Page } from 'playwright';

/**
 * Page Object Model - 明細画面
 */
@Injectable()
export class BankStatementPage {
  async navigateToStatementDownload(page: Page, target: CatFoodDto) {
    await page
      .getByRole('link', {
        name: `ご契約番号 ${target.contractNum} ${target.branchName}支店 普通`,
      })
      .click();
  }
}
