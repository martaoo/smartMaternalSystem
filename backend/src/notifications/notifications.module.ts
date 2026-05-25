import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [EmailService, SmsService],
  controllers: [NotificationsController],
  exports: [EmailService, SmsService],
})
export class NotificationsModule {}
