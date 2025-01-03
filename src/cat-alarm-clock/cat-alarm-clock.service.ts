import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import * as path from 'node:path';
import * as iconv from 'iconv-lite';
import { DepositAndWithdrawal } from 'src/models/deposit-and-withdrawal.model';
import { inspect } from 'node:util';

@Injectable()
export class CatAlarmClockService {
  constructor(private readonly configService: ConfigService) {}
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
      const data: DepositAndWithdrawal[] = [];
      const stream = fs
        .createReadStream(path.join(config.downloadPath, f))
        .pipe(iconv.decodeStream('Shift_JIS'));

      stream
        .pipe(parser)
        .on('data', (row) => data.push(this.parseLine(row)))
        .on('end', () => {
          console.log(inspect(data));
        })
        .on('error', (err) => {
          // 例外処理は、全体的に Result 型を導入するかも
          console.error('Error:', err);
        });
    }
  }
  /**
   * 1行を解析する
   *
   * @param line 一行
   */
  public parseLine = (line: string[]): DepositAndWithdrawal => {
    const getAmount = (val: string) => parseFloat(val.replaceAll(',', ''));
    return {
      date: line[0],
      summary: line[1],
      summaryContents: line[2],
      depositsAndWithdrawals: !!line[3]
        ? -1 * getAmount(line[3])
        : getAmount(line[4]),
      balance: getAmount(line[5]),
    };
  };
}
