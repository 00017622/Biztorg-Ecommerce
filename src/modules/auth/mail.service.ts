import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Ваш пароль для входа в BizTorg',
      template: join(process.cwd(), 'src', 'templates', 'verification'),
      context: {
        email,
        code,
        year: new Date().getFullYear(),
      },
      attachments: [
        {
          filename: 'banner.jpg',
          path: join(process.cwd(), 'public/images/banner.jpg'),
          cid: 'banner',
        },
      ],
    });
  }
}
