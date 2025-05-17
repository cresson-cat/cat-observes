import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class SlackService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendSlackMessage(message: string): Promise<void> {
    const slackBotToken = this.configService.get<string>('SLACK_BOT_TOKEN');
    const slackChannelId = this.configService.get<string>('SLACK_CHANNEL_ID');

    if (!slackBotToken) {
      throw new Error('SLACK_BOT_TOKEN is not defined in .env file.');
    }

    if (!slackChannelId) {
      throw new Error('SLACK_CHANNEL_ID is not defined in .env file.');
    }

    const headers = {
      Authorization: `Bearer ${slackBotToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    };

    const data = {
      channel: slackChannelId,
      text: message,
    };

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post('https://slack.com/api/chat.postMessage', data, {
          headers,
        }),
      );

      if (response.data.ok !== true) {
        throw new Error(`Failed to send Slack message: ${response.data.error}`);
      }
    } catch (error) {
      console.error(
        'Error sending Slack message:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      throw new Error(`Failed to send Slack message: ${error.message}`);
    }
  }
}
