import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EnvType } from 'src/config/env/env-validation';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly accessToken: string;
  private readonly instagramAccountId: string;
  private readonly defaultImage: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.getOrThrow<EnvType['INSTA_ACCESS_TOKEN']>('INSTA_ACCESS_TOKEN');
    this.instagramAccountId = this.configService.getOrThrow<EnvType['INSTA_ACCOUNT_ID']>('INSTA_ACCOUNT_ID');
    this.defaultImage = 'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg';

    if (!this.accessToken || !this.instagramAccountId) {
      throw new Error('Instagram configuration is missing: Access Token or Account ID.');
    }
  }

  async createCarouselPost(caption: string, images: string[]): Promise<any> {
    try {
      if (!images || images.length === 0) {
        images = [this.defaultImage];
      }

      if (images.length === 1) {
        return this.publishSingleImage(images[0], caption);
      }

      const creationIds: string[] = [];
      for (const image of images) {
        try {
          const creationId = await this.uploadImage(image);
          creationIds.push(creationId);
        } catch (err: any) {
          this.logger.error(`❌ Failed to upload carousel image: ${image}`, err.message);
        }
      }

      if (creationIds.length === 0) {
        throw new Error('Failed to upload any images for Instagram carousel post.');
      }

      return this.publishCarousel(creationIds, caption);
    } catch (err: any) {
      return { error: err.message };
    }
  }

  private async publishSingleImage(imageUrl: string, caption: string): Promise<any> {
    try {
      const uploadUrl = `https://graph.facebook.com/v17.0/${this.instagramAccountId}/media`;

      const uploadResponse = await axios.post(uploadUrl, {
        image_url: imageUrl,
        caption,
        access_token: this.accessToken,
      });

      const creationId = uploadResponse.data.id;

      await this.waitUntilReady(creationId);

      return this.publishMedia(creationId);
    } catch (err: any) {
      return { error: err.message };
    }
  }

  private async publishMedia(creationId: string): Promise<any> {
    try {
      const publishUrl = `https://graph.facebook.com/v17.0/${this.instagramAccountId}/media_publish`;

      const response = await axios.post(publishUrl, {
        creation_id: creationId,
        access_token: this.accessToken,
      });
      return response.data;
    } catch (err: any) {
      return { error: err.message, details: err.response?.data };
    }
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      const uploadUrl = `https://graph.facebook.com/v17.0/${this.instagramAccountId}/media`;

      const response = await axios.post(uploadUrl, {
        image_url: imageUrl,
        is_carousel_item: true,
        access_token: this.accessToken,
      });

      return response.data.id;
    } catch (err: any) {
      throw new Error(`Image upload failed: ${err.message}`);
    }
  }

  private async publishCarousel(creationIds: string[], caption: string): Promise<any> {
    try {

      const containerId = await this.createCarouselContainer(creationIds, caption);

      await this.waitUntilReady(containerId);

      const publishUrl = `https://graph.facebook.com/v17.0/${this.instagramAccountId}/media_publish`;
      const response = await axios.post(publishUrl, {
        creation_id: containerId,
        access_token: this.accessToken,
      });

      return response.data;
    } catch (err: any) {
      return { error: err.message };
    }
  }

  private async createCarouselContainer(creationIds: string[], caption: string): Promise<string> {
    try {
      const url = `https://graph.facebook.com/v17.0/${this.instagramAccountId}/media`;
      const response = await axios.post(url, {
        media_type: 'CAROUSEL',
        caption,
        children: creationIds,
        access_token: this.accessToken,
      });

      return response.data.id;
    } catch (err: any) {
      throw new Error(`Carousel container creation failed: ${err.message}`);
    }
  }

  private async waitUntilReady(creationId: string): Promise<void> {
    const statusUrl = `https://graph.facebook.com/v17.0/${creationId}?fields=status_code&access_token=${this.accessToken}`;

    for (let i = 0; i < 10; i++) {
      const response = await axios.get(statusUrl);
      const status = response.data.status_code;

      if (status === 'FINISHED') {
        return;
      }

      await new Promise(res => setTimeout(res, 3000));
    }
  }

  async deletePost(postId: string): Promise<any> {
    try {
      const url = `https://graph.facebook.com/${postId}`;

      const response = await axios.post(url, {
        caption: 'Объявление было удалено и неактивно',
        access_token: this.accessToken,
        comment_enabled: false,
      });

      return response.data;
    } catch (err: any) {
      return { error: err.message };
    }
  }
}
