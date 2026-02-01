import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { SocialsProfileDto } from './dto/auth.dto';

@Injectable()
export class FacebookService {
  private readonly baseUrl = 'https://graph.facebook.com/me';

  async verifyAccessToken(token: string): Promise<SocialsProfileDto> {
    try {
      const response = await axios.get<SocialsProfileDto>(this.baseUrl, {
        params: {
          fields: 'id,name,email',
          access_token: token,
        },
      });

      const profile = response.data;

      if (!profile?.email) {
        throw new UnauthorizedException('Email not available from Facebook');
      }

      return profile;
    } catch (error) {
        console.error('Facebook token verification failed:', error.response?.data || error.message);
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }
}
