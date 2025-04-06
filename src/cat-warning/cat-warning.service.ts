import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsageHistoryRepository } from 'src/firestore/usage-history/usage-history.repository';
import { SlackService } from 'src/slack/slack.service';

@Injectable()
export class CatWarningService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usageHistoryRepository: UsageHistoryRepository,
    private readonly slackService: SlackService,
  ) {}

  /**
   * Send a Slack notification
   */
  async sendSlackNotification(): Promise<void> {
    try {
      // 閾値の取得と検証をメソッドの先頭に移動
      const thresholdsString = this.configService.get<string>('THRESHOLDS');

      if (!thresholdsString) {
        throw new Error('THRESHOLDS is not defined in .env file.');
      }

      const thresholds: number[] = thresholdsString
        .split(',')
        .map((threshold) => {
          const num = parseInt(threshold, 10);
          if (isNaN(num)) {
            throw new Error(
              `Invalid THRESHOLD value: ${threshold}. Must be a number.`,
            );
          }
          return num;
        });

      // Fetch the recent history
      const history = await this.usageHistoryRepository.fetchRecentHistory();
      const data = history.data();

      // 閾値を昇順にソートし、最初に残高を下回る閾値を見つける
      const targetThreshold = thresholds
        .sort((a, b) => a - b)
        .find((threshold) => data.balance <= threshold);

      if (!targetThreshold) {
        // Slack通知を送信
        await this.slackService.sendSlackMessage(
          `残高が ¥${targetThreshold} より少ない.. 今 ¥${data.balance} にゃん！`,
        );
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      throw new Error(`Failed to send Slack notification: ${error.message}`);
    }
  }
}
