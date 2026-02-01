import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TelegramService } from '../product/telegram.service';
import { FacebookService } from '../product/facebook.service';
import { InstagramService } from '../product/instagram.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/database/schema';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';

@Processor('socialPostCreateQueue')
export class SocialPostProcessor extends WorkerHost {
  constructor(
    private telegramService: TelegramService,
    private facebookService: FacebookService,
    private instagramService: InstagramService,
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {

    const { product, contactName, contactPhone, images, isShop, shopName } = job.data;

   const fallbackImage =
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8';

const imagesToUse: string[] =
  images && images.length > 0
    ? images
    : [fallbackImage];

    try {
      const locationUrl = `https://yandex.ru/maps/?ll=${product.longitude},${product.latitude}&z=17&l=map&pt=${product.longitude},${product.latitude},pm2rdm`;
      const productUrl = `https://biztorg.uz/obyavlenie/${product.slug}`;
      const buttonText = 'Перейти к объявлению ➡️';

let telegramMessage = `📢 <b>Объявление:</b> ${product.name}\n`;

if (isShop && shopName) {
  telegramMessage += `🏪 <b>Магазин:</b> ${shopName}\n`;
}

telegramMessage += `
📝 <b>Описание:</b> ${product.description}

📍 <b>Регион:</b> ${product.regionName ?? ''}

👤 <b>Контактное лицо:</b> ${contactName ?? 'Не указано'}

📞 <b>Номер телефона:</b> ${contactPhone ?? 'Не указан'}

🌍 <b>Локация:</b> <a href="https://yandex.ru/maps/?ll=${product.longitude},${product.latitude}&z=17&l=map&pt=${product.longitude},${product.latitude},pm2rdm">Местоположение в Yandex maps</a>

🌐 <b>Подробнее по ссылке:</b> <a href="https://biztorg.uz/obyavlenie/${product.slug}">Перейти</a>
`;

     
let facebookMessage = `📢 Объявление: ${product.name}\n`;

if (isShop && shopName) {
  facebookMessage += `🏪 Магазин: ${shopName}\n`;
}

facebookMessage += `
📝 Описание: ${product.description}

📍 Регион: ${product.regionName ?? ''}

👤 Контактное лицо: ${contactName ?? 'Не указано'}

📞 Номер телефона: ${contactPhone ?? 'Не указан'}

🌍 Локация: https://yandex.ru/maps/?ll=${product.longitude},${product.latitude}&z=17&l=map&pt=${product.longitude},${product.latitude},pm2rdm

🌐 Подробнее: https://biztorg.uz/obyavlenie/${product.slug}
`;
    

let instagramMessage = `📢 Объявление: ${product.name}\n`;

if (isShop && shopName) {
  instagramMessage += `🏪 Магазин: ${shopName}\n`;
}

instagramMessage += `
📝 Описание: ${product.description}

📍 Регион: ${product.regionName ?? ''}

👤 Контактное лицо: ${contactName ?? 'Не указано'}

📞 Номер телефона: ${contactPhone ?? 'Не указан'}

🌍 Локация: https://yandex.ru/maps/?ll=${product.longitude},${product.latitude}&z=17&l=map&pt=${product.longitude},${product.latitude},pm2rdm

🌐 Подробнее: https://biztorg.uz/obyavlenie/${product.slug}
`;

      let telegramPostId: string | null = null;
      try {
        let telegramResponse;

        if (imagesToUse.length > 1) {

          const media = imagesToUse.map((url, index) => ({
            type: 'photo',
            media: url || fallbackImage,
            parse_mode: 'HTML',
            ...(index === 0 ? { caption: telegramMessage } : {}),
          }));
          telegramResponse = await this.telegramService.sendMediaGroup(media, buttonText, productUrl);

        } else if (imagesToUse.length === 1) {
          telegramResponse = await this.telegramService.sendPhoto(
            imagesToUse[0] || fallbackImage,
            telegramMessage,
            buttonText,
            productUrl,
          );

        } else {
          telegramResponse = await this.telegramService.sendMessage(
            telegramMessage,
            buttonText,
            productUrl,
          );
        }

        telegramPostId = telegramResponse?.result?.message_id ?? null;
        console.log(`Telegram response for product ${product.id}:`, telegramResponse);
      } catch (e) {
        console.error('Telegram post error:', e.message);
      }

      let facebookPostId: string | null = null;
      try {
        const fbPost = await this.facebookService.createPost(
  facebookMessage,
  imagesToUse.map((url) => ({ id: null, image_url: url })),
);
        facebookPostId = fbPost?.id?.split('_')[1] ?? null;
      } catch (e) {
        console.error('Facebook post error:', e.message);
      }

      let instaPostId: string | null = null;
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const instaPost = await this.instagramService.createCarouselPost(instagramMessage, imagesToUse.length ? imagesToUse : [fallbackImage]);
          instaPostId = instaPost?.id ?? null;
          break;
        } catch (e) {
          console.warn(`Instagram attempt ${attempt} failed:`, e.message);
          if (attempt === maxAttempts) console.error('Failed to post to Instagram after retries');
          await new Promise((res) => setTimeout(res, 2000));
        }
      }

      await this.db
        .update(schema.productsSchema)
        .set({
          telegramPostId,
          facebookPostId,
          instagramPostId: instaPostId,
        })
        .where(eq(schema.productsSchema.id, product.id));
        
    } catch (err) {
      console.error(`❌ Failed to post to social media for product ${job.id}:`, err);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed:`, err.message);
  }
}
