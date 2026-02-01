import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { EnvType } from 'src/config/env/env-validation';

@Injectable()
export class FirebaseService implements OnModuleInit {
  public messaging: admin.messaging.Messaging;

  constructor(protected configService: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length === 0) {
      const firebaseConfig = {
        type: this.configService.getOrThrow<EnvType['FIREBASE_TYPE']>('FIREBASE_TYPE'),
        project_id: this.configService.getOrThrow<EnvType['FIREBASE_PROJECT_ID']>('FIREBASE_PROJECT_ID'),
        private_key_id: this.configService.getOrThrow<EnvType['FIREBASE_PRIVATE_KEY_ID']>('FIREBASE_PRIVATE_KEY_ID'),
        private_key: this.configService.getOrThrow<EnvType['FIREBASE_PRIVATE_KEY']>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        client_email: this.configService.getOrThrow<EnvType['FIREBASE_CLIENT_EMAIL']>('FIREBASE_CLIENT_EMAIL'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      });

      this.messaging = admin.messaging();
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: admin.messaging.Message = {
      token,
      notification: { title, body },
      data: data || {},
    };

    try {
      const res = await this.messaging.send(message);
      return res;
    } catch (err) {
      console.error('❌ Error sending notification:', err);
      throw err;
    }
  }
}