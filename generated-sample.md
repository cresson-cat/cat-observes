```typescript
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.bk.mufg.jp/index.html');
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: '個人向けインターネットバンキング ログイン 三菱ＵＦＪダイレクト' }).click();
  const page1 = await page1Promise;
  await page1.getByPlaceholder('半角数字', { exact: true }).click();
  await page1.getByPlaceholder('半角数字', { exact: true }).click();
  await page1.getByPlaceholder('半角数字', { exact: true }).fill('9499089344');
  await page1.getByPlaceholder('半角英数字・記号 4～16桁').click();
  await page1.getByPlaceholder('半角英数字・記号 4～16桁').fill('HiddenOwl3_');
  await page1.getByRole('button', { name: 'ログイン', exact: true }).click();
  await page1.getByRole('link', { name: 'ご契約番号 9499089344 新橋支店 普通' }).click();
  await page1.getByRole('link', { name: '明細ダウンロード' }).click();
  await page1.getByText('最近10日間').click();
  page1.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  const downloadPromise = page1.waitForEvent('download');
  await page1.getByRole('button', { name: 'ダウンロード（CSV形式）' }).click();
  const download = await downloadPromise;
  await page1.getByRole('link', { name: 'ログアウト' }).click();
});
```
