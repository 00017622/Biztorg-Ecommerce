import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvType } from 'src/config/env/env-validation';

interface FacebookPhoto {
  id?: string | null;
  image_url: string;
}

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly pageAccessToken: string;
  private readonly pageId: string;

  constructor(private readonly configService: ConfigService) {
    this.pageAccessToken = this.configService.getOrThrow<EnvType['FACEBOOK_PAGE_ACCESS_TOKEN']>(
      'FACEBOOK_PAGE_ACCESS_TOKEN',
    );
    this.pageId = this.configService.getOrThrow<EnvType['FACEBOOK_PAGE_ID']>('FACEBOOK_PAGE_ID');

    if (!this.pageAccessToken || !this.pageId) {
      throw new Error('Facebook configuration is missing: Page Access Token or Page ID.');
    }
  }

  getGraphUrl(endpoint: string): string {
    return `https://graph.facebook.com/${this.pageId}${endpoint}`;
  }

  async createPost(message: string, photos?: FacebookPhoto[]): Promise<any> {
    try {
      const url = `https://graph.facebook.com/${this.pageId}/feed`;
      const photoIds: string[] = [];

      if (!photos || photos.length === 0) {
        const defaultImageUrl =
          'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg';

        const defaultImageSent = await this.uploadImages(defaultImageUrl);
        if (!defaultImageSent || defaultImageSent.error) {
          throw new Error('Failed to upload the default image.');
        }
        photoIds.push(defaultImageSent.id);
      } else {
        for (const photo of photos) {
          const imageSent = await this.uploadImages(photo.image_url);
          if (!imageSent || imageSent.error) {
            throw new Error(`Image upload failed for URL: ${photo.image_url}`);
          }
          photoIds.push(imageSent.id);
        }
      }

      const response = await axios.post(url, {
        message,
        access_token: this.pageAccessToken,
        attached_media: photoIds.map((id) => ({ media_fbid: id })),
      });

      return response.data;
    } catch (err: any) {
      const status = err.response?.status;
      const fbError = err.response?.data?.error;

      return { error: err.message, details: fbError || null };
    }
  }

  async uploadImages(photoUrl: string): Promise<any> {
    try {
      const url = `https://graph.facebook.com/${this.pageId}/photos`;
      const response = await axios.post(url, {
        url: photoUrl,
        access_token: this.pageAccessToken,
        published: false,
      });

      return response.data;
    } catch (err: any) {
      const status = err.response?.status;
      const fbError = err.response?.data?.error;

      return { error: err.message, details: fbError || null };
    }
  }

  async updatePost(postId: string, message: string): Promise<any> {
  try {

    const url = `https://graph.facebook.com/${this.pageId}_${postId}`;

    const response = await axios.post(url, {
      message,
      access_token: this.pageAccessToken,
    });

    if (response.status >= 400) {
      throw new Error(`Facebook post update failed: ${response.data?.error?.message || 'Unknown error'}`);
    }

    return response.data;
  } catch (err: any) {
    const status = err.response?.status;
    const fbError = err.response?.data?.error;

    return { error: err.message, details: fbError || null };
  }
}

  async deletePost(postId: string): Promise<any> {
    try {
      const url = `https://graph.facebook.com/${this.pageId}_${postId}`;
      const response = await axios.delete(url, {
        params: { access_token: this.pageAccessToken },
      });
      return response.data;
    } catch (err: any) {
      const status = err.response?.status;
      const fbError = err.response?.data?.error;

      return { error: err.message, details: fbError || null };
    }
  }
}
