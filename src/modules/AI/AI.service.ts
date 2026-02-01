import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

@Injectable()
export class AIService {
  private MISTRAL_API_KEY: string;

  constructor(private readonly configService: ConfigService) {
    this.MISTRAL_API_KEY = this.configService.getOrThrow<string>('MISTRAL_API_KEY');
  }

  async generateDescription(productTitle: string): Promise<string> {
    try {
      const { data } = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI that writes concise, engaging, and SEO-friendly product descriptions. ' +
                'Do not include any tokens like <s>, [OUT], or [IN]. Only return the description text.',
            },
            {
              role: 'user',
              content: `Generate a compelling product description for: "${productTitle}"`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let message = data?.choices?.[0]?.message?.content;

      if (!message) {
        throw new InternalServerErrorException('AI did not return a valid response.');
      }

      message = message.replace(/^<s>\s*\[OUT\]\s*/i, '').trim();

      return message;
    } catch (err) {
      const error = err as AxiosError;
      throw new InternalServerErrorException('Failed to generate product description.');
    }
  }
}