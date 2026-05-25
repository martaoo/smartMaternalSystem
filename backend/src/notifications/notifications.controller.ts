import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly emailService: EmailService) {}

  // Dev-only endpoint to fetch last reset preview URL. Enabled only when DEV_EMAIL_DEBUG=true
  @Get('dev/last-reset-preview')
  getLastResetPreview() {
    if (process.env.DEV_EMAIL_DEBUG !== 'true') {
      throw new ForbiddenException('Disabled');
    }
    const url = this.emailService.getLastResetPreviewUrl();
    const html = this.emailService.getLastResetHtml?.() ?? undefined;
    return { previewUrl: url, html };
  }
}
