/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from 'src/database/schema';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';
import { TelegramService } from '../product/telegram.service';
import { FacebookService } from '../product/facebook.service';

type RegionRow = {
  id: string;
  name: string;
  slug: string;
  parent?: RegionRow | null;
};

type UserRow = {
  id: string;
  name: string | null;
  phone: string | null;
};

@Processor('socialPostUpdateQueue')
export class UpdateSocialPostProcessor extends WorkerHost {
  private readonly logger = new Logger(UpdateSocialPostProcessor.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly facebookService: FacebookService,
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  async process(job: Job<{ productId: string; updatedData: any }>): Promise<void> {
    const { productId, updatedData } = job.data;

    try {
      const product = await this.db.query.productsSchema.findFirst({
        where: eq(schema.productsSchema.id, productId),
        with: {
          region: { with: { parent: true } },
          user: { with: { profile: true } },
        },
      });

      if (!product) {
        return;
      }

      const region = product.region as RegionRow | null;
      const user = product.user as UserRow;

      const isShop = false;

      const contactName = user?.name ?? 'Без имени';
      const contactPhone = user?.phone ?? 'Не указан';
      const shopName: string | null = null;

      const regionName = region
        ? `${region.parent?.name ?? ''}${region.parent ? ', ' : ''}${region.name}`
        : 'Регион не указан';

      let telegramMessage = `📢 <b>Объявление:</b> ${updatedData.name}\n`;

      if (isShop && shopName) {
        telegramMessage += `🏪 <b>Магазин:</b> ${shopName}\n`;
      }

      telegramMessage += `
📝 <b>Описание:</b> ${updatedData.description}

📍 <b>Регион:</b> ${regionName}

👤 <b>Контактное лицо:</b> ${contactName}

📞 <b>Телефон:</b> ${contactPhone}

🌍 <b>Карта:</b> <a href="https://yandex.ru/maps/?ll=${product.longitude},${product.latitude}&z=17&l=map&pt=${product.longitude},${product.latitude},pm2rdm">
Местоположение в Yandex Maps
</a>
`;

      // 🗺️ Facebook message
      let facebookMessage = `
📢 Объявление: ${updatedData.name}
`;

      if (isShop && shopName) {
        facebookMessage += `🏪 Магазин: ${shopName}\n`;
      }

      facebookMessage += `
📝 Описание: ${updatedData.description}

📍 Регион: ${regionName}

👤 Контактное лицо: ${contactName}

📞 Телефон: ${contactPhone}

🌍 Локация: https://yandex.ru/maps/?ll=${product.longitude},${product.latitude}&z=17&l=map&pt=${product.longitude},${product.latitude},pm2rdm
`;

      const productUrl = `https://biztorg.uz/obyavlenie/${product.slug}`;
      const buttonText = 'Перейти к объявлению ➡️';

      if (product.telegramPostId) {
        try {
          await this.telegramService.updateMessage(
            product.telegramPostId,
            telegramMessage,
            buttonText,
            productUrl,
          );
        } catch (e: any) {
          this.logger.error(`Telegram update failed: ${e.message}`);
        }
      }

      if (product.facebookPostId) {
        try {
          await this.facebookService.updatePost(
            product.facebookPostId,
            facebookMessage,
          );
        } catch (e: any) {
          this.logger.error(`Facebook update failed: ${e.message}`);
        }
      }

    } catch (error: any) {
      this.logger.error(`Error updating social media posts: ${error.message}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Update job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Update job ${job.id} failed: ${err.message}`);
  }
}