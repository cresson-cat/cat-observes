import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import * as path from 'node:path';
import * as iconv from 'iconv-lite';
import { DepositAndWithdrawal } from 'src/models/deposit-and-withdrawal.model';
import { UsageHistoryRepository } from 'src/firestore/usage-history/usage-history.repository';
import { forkJoin } from 'rxjs';

@Injectable()
export class CatAlarmClockService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usageHistoryRepository: UsageHistoryRepository,
  ) {}

  /**
   * CSV のパース
   *
   * @param files
   */
  public wakeUp(files: string[]) {
    const config = (() => {
      return {
        downloadPath: this.configService.get<string>('DOWNLOAD_PATH'),
      };
    })();

    const parser = parse({
      delimiter: ',',
      fromLine: 2,
      skip_empty_lines: true,
    });

    for (const f of files) {
      const records: DepositAndWithdrawal[] = [];
      const stream = fs
        .createReadStream(path.join(config.downloadPath, f))
        .pipe(iconv.decodeStream('Shift_JIS'));

      stream
        .pipe(parser)
        .on('data', (row) => records.push(this.parseLine(row)))
        .on('end', () => {
          forkJoin(records.map(this.saveOneLine)).subscribe({
            next: () => console.log('All registrations successful'),
            /* - この部分は stream が内外で2本になっている（ReadWriteStream / Observable）
             * - 例外処理は全体的に Result 型を導入した方が良いかも
             * - throwError 等を使用して throw した時の、アプリの動作を確認した方が良さそう */
            error: (err) => console.error(err),
          });
        })
        // この部分と合わせてテストした方が良さそう
        .on('error', (err) => {
          console.error('Error:', err);
        });
    }
  }

  /**
   * 1行を解析する
   *
   * @param line 1行
   */
  public parseLine = (line: string[]): DepositAndWithdrawal => {
    const getAmount = (val: string) => parseFloat(val.replaceAll(',', ''));
    return {
      date: line[0],
      summary: line[1],
      summary_contents: line[2],
      deposits_and_withdrawals: !!line[3]
        ? -1 * getAmount(line[3])
        : getAmount(line[4]),
      balance: getAmount(line[5]),
    };
  };

  /**
   * 1行毎にデータ登録
   *
   * @param line 1行
   * @returns 1行毎の登録結果
   */
  private saveOneLine = async (line: DepositAndWithdrawal) => {
    const { date, balance, summary, summary_contents } = line;
    // <date>_<balance>
    const firstPart = `${date.replaceAll('/', '-')}_${balance.toString().padStart(7, '0')}`;
    // <summary>_<summary-content> ※ base64化（"/" は使用不可のため）
    const base64Encoded = Buffer.from(
      `${summary}_${summary_contents}`,
    ).toString('base64');
    return await this.usageHistoryRepository.save(
      line,
      `${firstPart}_${base64Encoded}`,
    );
  };
}
