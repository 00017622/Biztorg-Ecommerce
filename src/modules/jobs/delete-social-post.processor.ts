import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TelegramService } from '../product/telegram.service';
import { FacebookService } from '../product/facebook.service';
import { InstagramService } from '../product/instagram.service';

@Processor('socialPostDeleteQueue')
export class DeleteSocialPostProcessor extends WorkerHost {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { telegramPostId, facebookPostId } = job.data;

    if (telegramPostId) {
      try {
        const res = await this.telegramService.deleteMessage(telegramPostId);
      } catch (err) {
        console.error('Telegram delete error:', err.message);
      }
    }

    if (facebookPostId) {
      try {
        const res = await this.facebookService.deletePost(facebookPostId);
      } catch (err) {
        console.error('Facebook delete error:', err.message);
      }
    }

    // if (instaPostId) {
    //   try {
    //     const res = await this.instagramService.deletePost(instaPostId);
    //     console.log('✅ Instagram delete response:', res);
    //   } catch (err) {
    //     console.error('❌ Instagram delete error:', err.message);
    //   }
    // }

    console.log('[DeleteSocialPostProcessor] Deletion job completed');
  }
}