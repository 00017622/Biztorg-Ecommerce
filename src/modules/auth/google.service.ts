import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { SocialsProfileDto } from './dto/auth.dto';

@Injectable()
export class GoogleService {

  async verifyAccessToken(accessToken: string): Promise<SocialsProfileDto> {
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!data?.email) {
        throw new UnauthorizedException('Google token did not return an email');
      }

      return {
        id: data.sub, 
        email: data.email,
        name: data.name || '',
      };
    } catch (err: any) {
      console.error('Google access token fetch failed:', err.response?.data || err.message);
      throw new UnauthorizedException('Invalid Google access token');
    }
  }
}
