import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Pregnancy, PregnancyDocument } from './schemas/pregnancy.schema';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';

@Injectable()
export class PregnancyReminderService {
  private readonly logger = new Logger(PregnancyReminderService.name);

  constructor(
    @InjectModel(Pregnancy.name)
    private readonly pregnancyModel: Model<PregnancyDocument>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Runs every day at 8:00 AM.
   * Finds all pregnancy records whose nextVisitDate is tomorrow
   * and haven't had a reminder sent, then notifies the mother.
   */
  @Cron('0 8 * * *', { name: 'pregnancy-visit-reminders' })
  async sendDailyReminders(): Promise<void> {
    this.logger.log('Running daily pregnancy visit reminder job...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);

    let records: any[];
    try {
      records = await this.pregnancyModel
        .find({
          nextVisitDate: { $gte: start, $lte: end },
          visitReminderSent: false,
        })
        .populate({
          path: 'motherId',
          select: 'name phone email',
        })
        .populate({
          path: 'hospitalId',
          select: 'name',
        })
        .lean()
        .exec();
    } catch (err) {
      this.logger.error(`Failed to query pregnancy records: ${err.message}`);
      return;
    }

    this.logger.log(`Found ${records.length} pregnancy visit(s) due tomorrow.`);

    let successCount = 0;
    let failCount = 0;

    for (const record of records) {
      const mother = record.motherId as any;
      const facility = record.hospitalId as any;

      if (!mother) {
        this.logger.warn(`Record ${record._id}: missing mother data, skipping.`);
        failCount++;
        continue;
      }

      const motherName: string = mother.name ?? 'Dear Mother';
      const gestationalAge: number = record.gestationalAge ?? record.week ?? 0;
      const facilityName: string = facility?.name ?? 'your health center';
      const nextVisitDate: Date = new Date(record.nextVisitDate);

      // Send SMS
      if (mother.phone) {
        await this.smsService.sendPregnancyVisitReminder(
          mother.phone,
          motherName,
          nextVisitDate,
          gestationalAge,
        );
      }

      // Send Email
      if (mother.email) {
        await this.emailService.sendPregnancyVisitReminder(
          mother.email,
          motherName,
          nextVisitDate,
          gestationalAge,
          facilityName,
        );
      }

      // Mark reminder as sent
      try {
        await this.pregnancyModel.findByIdAndUpdate(record._id, {
          visitReminderSent: true,
          visitReminderSentDate: new Date(),
        });
        successCount++;
      } catch (err) {
        this.logger.error(`Failed to mark record ${record._id} as sent: ${err.message}`);
        failCount++;
      }
    }

    this.logger.log(
      `Pregnancy visit reminder job complete. Sent: ${successCount}, Failed: ${failCount}.`,
    );
  }

  /** Manual trigger for testing without waiting for 8 AM */
  async triggerManually(): Promise<{ message: string }> {
    this.logger.log('Manual trigger: running pregnancy visit reminder job now...');
    await this.sendDailyReminders();
    return { message: 'Pregnancy visit reminder job triggered. Check server logs for results.' };
  }
}
