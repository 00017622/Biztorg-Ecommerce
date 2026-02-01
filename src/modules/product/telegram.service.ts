import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EnvType } from 'src/config/env/env-validation';

@Injectable()
export class TelegramService {
  // private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.getOrThrow<EnvType['TELEGRAM_BOT_TOKEN']>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.getOrThrow<EnvType['TELEGRAM_CHAT_ID']>('TELEGRAM_CHAT_ID');
  }

  private getApiUrl(method: string): string {
    return `https://api.telegram.org/bot${this.botToken}/${method}`;
  }

  // private logAxiosError(context: string, e: any) {
  //   const status = e.response?.status;
  //   const description = e.response?.data?.description;
  //   const data = e.response?.data;
  //   const message = e.message;

  //   if (status) this.logger.error(`Status: ${status}`);
  //   if (description) this.logger.error(`Description: ${description}`);
  //   if (data) this.logger.debug(`Response data: ${JSON.stringify(data, null, 2)}`);
  //   this.logger.error(`Message: ${message}`);
  // }

  async sendMessage(message: string, buttonText = '🔗 Подробнее', productUrl = '') {
    try {
      const url = this.getApiUrl('sendMessage');
      const payload = {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: buttonText, url: productUrl }]],
        },
      };

      const { data } = await axios.post(url, payload);

      return data;
    } catch (e) {
      return { error: e.message, details: e.response?.data };
    }
  }

  async sendPhoto(photoUrl: string, caption: string, buttonText = '🔗 Подробнее', productUrl = '') {
    try {
      const url = this.getApiUrl('sendPhoto');
      const payload = {
        chat_id: this.chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: buttonText, url: productUrl }]],
        },
      };

      const { data } = await axios.post(url, payload);

      return data;
    } catch (e) {
      return { error: e.message, details: e.response?.data };
    }
  }

  async sendMediaGroup(media: any[], buttonText = 'Подробнее', productUrl = '') {
    try {
      const url = this.getApiUrl('sendMediaGroup');
      const payload = {
        chat_id: this.chatId,
        media,
      };

      const { data } = await axios.post(url, payload);

      if (productUrl) {
        const followUp = await this.sendMessage('', buttonText, productUrl);
        return { ...data, follow_up_message: followUp };
      }

      return data;
    } catch (e) {
      return { error: e.message, details: e.response?.data };
    }
  }

async deleteMessage(messageId: string) {
  try {
    const url = this.getApiUrl('deleteMessage');
    const payload = {
      chat_id: this.chatId,
      message_id: messageId,
    };

    const response = await axios.post(url, payload, { validateStatus: () => true });

    return response.data;
  } catch (e) {
    return {
      error: e.message,
      status: e.response?.status,
      details: e.response?.data,
    };
  }
}


  async updateMessage(messageId: string, text: string, buttonText = 'Подробнее', productUrl = '') {
    try {

      const replyMarkup = {
        inline_keyboard: [[{ text: buttonText, url: productUrl }]],
      };

      let url = this.getApiUrl('editMessageCaption');
      let payload: any = {
        chat_id: this.chatId,
        message_id: messageId,
        caption: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      };

      let response = await axios.post(url, payload);

      if (!response.data.ok) {

        url = this.getApiUrl('editMessageText');
        payload = {
          chat_id: this.chatId,
          message_id: messageId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        };

        response = await axios.post(url, payload);
      }

      return response.data;
    } catch (e) {
      return { error: e.message, details: e.response?.data };
    }
  }
}