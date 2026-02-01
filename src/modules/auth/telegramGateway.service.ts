import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TelegramGatewayService {
  private readonly api: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.api = axios.create({
      baseURL: 'https://gatewayapi.telegram.org',
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${this.configService.getOrThrow<string>(
          'TG_GATEWAY_TOKEN',
        )}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendCode(phone: string) {
    try {
      const response = await this.api.post('/sendVerificationMessage', {
        phone_number: phone,
        code_length: 6,
        ttl: 60,
        payload: 'auth',
      });

      const data = response.data;

      if (!data?.ok) {
        throw new BadRequestException(data?.error || 'Не удалось отправить код подтверждения через Telegram');
      }

      return data.result;
    } catch (err: any) {
      this.handleAxiosError(err, 'Ошибка при отправке кода подтверждения через Telegram');
    }
  }

  async verifyCode(requestId: string, code: string) {
    try {
      const response = await this.api.post('/checkVerificationStatus', {
        request_id: requestId,
        code,
      });

      const data = response.data;

      if (!data?.ok) {
        throw new BadRequestException(data?.error || 'Ошибка проверки кода подтверждения');
      }

      return data.result?.verification_status?.status;
    } catch (err: any) {
      this.handleAxiosError(err, 'Ошибка при проверке кода подтверждения Telegram');
    }
  }

  async revokeCode(requestId: string) {
    try {
      const response = await this.api.post('/revokeVerificationMessage', {
        request_id: requestId,
      });

      const data = response.data;

      if (!data?.ok) {
        throw new BadRequestException(data?.error || 'Не удалось отменить код подтверждения');
      }

      return true;
    } catch (err: any) {
      this.handleAxiosError(err, 'Ошибка при отмене кода подтверждения Telegram');
    }
  }
  
  private handleAxiosError(err: any, defaultMessage: string): never {
    if (err.response?.data) {
      throw new BadRequestException(
        err.response.data.error || defaultMessage,
      );
    }

    throw new InternalServerErrorException(defaultMessage);
  }
}
