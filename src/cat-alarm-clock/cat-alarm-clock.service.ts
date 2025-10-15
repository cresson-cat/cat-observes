import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import * as path from 'node:path';
import * as iconv from 'iconv-lite';
import { DepositAndWithdrawal } from 'src/models/deposit-and-withdrawal.model';
import { UsageHistoryRepository } from 'src/firestore/usage-history/usage-history.repository';
import * as base32 from 'thirty-two';
import { concatMap, from, toArray } from 'rxjs';
import { parse as parseDate, format } from 'date-fns';
import { TZDate } from '@date-fns/tz';

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

    from(files)
      .pipe(
        concatMap((f) => {
          const filePath = path.join(config.downloadPath, f);
          console.log(`File path: ${filePath}`);
          const stream = fs
            .createReadStream(filePath)
            .pipe(iconv.decodeStream('Shift_JIS'))
            .pipe(parser);
          // @note csv の各行をパースした stream を Observable に変換
          return from(stream);
        }),
        concatMap((row: string[]) =>
          // @note csv の各行を非同期で登録
          from(this.saveOneLine(this.parseLine(row))),
        ),
        toArray(), // @note 全ての this.saveOneLine の結果を配列にまとめる
      )
      .subscribe({
        next: () => console.log('All registrations successful'),
        error: (err) => console.error('Error:', err),
      });
  }

  /**
   * 1行を解析する
   *
   * @param line 1行
   */
  public parseLine = (line: string[]): DepositAndWithdrawal => {
    const getAmount = (val: string) => parseFloat(val.replaceAll(',', ''));
    const refDate = new TZDate(new Date(), 'Asia/Tokyo'); // 基準日（タイムゾーン指定）
    const date = parseDate(line[0], 'yyyy/M/d', refDate);
    const formattedDate = format(date, 'yyyyMMdd');
    return {
      date: parseFloat(formattedDate),
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
  private saveOneLine = async (
    line: DepositAndWithdrawal,
  ): Promise<FirebaseFirestore.WriteResult> => {
    const { date, balance, summary, summary_contents } = line;
    // <date>_<balance>
    const firstPart = `${date}_${balance.toString().padStart(7, '0')}`;
    // <summary>_<summary-content> ※ base32エンコード（"/" を使用しない）
    const encoded = base32.encode(`${summary}_${summary_contents}`);
    // 登録
    return await this.usageHistoryRepository.save(
      line,
      `${firstPart}_${encoded}`,
    );
  };
}
