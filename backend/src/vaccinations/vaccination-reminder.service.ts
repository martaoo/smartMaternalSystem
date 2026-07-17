import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { VaccinationRecord, VaccinationRecordDocument } from './schemas/vaccination-record.schema';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';

@Injectable()
export class VaccinationReminderService {
  private readonly logger = new Logger(VaccinationReminderService.name);

  constructor(
    @InjectModel(VaccinationRecord.name)
    private readonly vaccinationRecordModel: Model<VaccinationRecordDocument>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Runs every day at 8:00 AM.
   * Sends reminders for vaccinations due in 3 days, 1 day, and today.
   * Each window uses a separate flag so the mother gets all three reminders.
   */
  @Cron('0 8 * * *', { name: 'vaccination-reminders' })
  async sendDailyReminders(): Promise<void> {
    this.logger.log('Running vaccination reminder job (3-day, 1-day, same-day)...');

    await Promise.all([
      this.sendForDaysAhead(3, 'reminder3DaySent'),
      this.sendForDaysAhead(1, 'reminderSent'),
      this.sendForDaysAhead(0, 'reminderSameDaySent'),
    ]);

    this.logger.log('Vaccination reminder job complete.');
  }

  private async sendForDaysAhead(
    daysAhead: number,
    sentFlag: 'reminder3DaySent' | 'reminderSent' | 'reminderSameDaySent',
  ): Promise<void> {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const start = new Date(target); start.setHours(0, 0, 0, 0);
    const end   = new Date(target); end.setHours(23, 59, 59, 999);

    let records: any[];
    try {
      records = await this.vaccinationRecordModel
        .find({
          status: 'SCHEDULED',
          scheduledDate: { $gte: start, $lte: end },
          [sentFlag]: { $ne: true },
        })
        .populate({
          path: 'childId',
          select: 'name birthDate motherId birthHospital',
          populate: [
            { path: 'motherId',     select: 'name phone email' },
            { path: 'birthHospital', select: 'name' },
          ],
        })
        .populate('vaccineId', 'name code')
        .lean()
        .exec();
    } catch (err) {
      this.logger.error(`[${sentFlag}] Query failed: ${err.message}`);
      return;
    }

    const label = daysAhead === 0 ? 'today' : `in ${daysAhead} day(s)`;
    this.logger.log(`[${sentFlag}] Found ${records.length} vaccination(s) due ${label}`);

    for (const record of records) {
      const child       = record.childId as any;
      const mother      = child?.motherId as any;
      const vaccine     = record.vaccineId as any;
      const facility    = child?.birthHospital as any;

      if (!mother || !vaccine) {
        this.logger.warn(`Record ${record._id}: missing mother/vaccine, skipping.`);
        continue;
      }

      const motherName   = mother.name   ?? 'Dear Mother';
      const childName    = child.name    ?? 'your child';
      const vaccineName  = vaccine.name  ?? vaccine.code ?? 'vaccination';
      const facilityName = facility?.name ?? 'your health center';
      const scheduledDate = new Date(record.scheduledDate);

      // SMS
      if (mother.phone) {
        await this.smsService.sendVaccinationReminder(
          mother.phone, motherName, childName, vaccineName, scheduledDate,
        ).catch(err => this.logger.error(`SMS failed for ${record._id}: ${err.message}`));
      }

      // Email
      if (mother.email) {
        await this.emailService.sendVaccinationReminder(
          mother.email, motherName, childName, vaccineName, scheduledDate, facilityName,
        ).catch(err => this.logger.error(`Email failed for ${record._id}: ${err.message}`));
      }

      // Mark this specific flag as sent
      try {
        await this.vaccinationRecordModel.findByIdAndUpdate(record._id, {
          [sentFlag]: true,
          reminderSentDate: new Date(),
        });
      } catch (err) {
        this.logger.error(`Failed to mark ${sentFlag} for ${record._id}: ${err.message}`);
      }
    }
  }

  /** Manual trigger for testing */
  async triggerManually(): Promise<{ sent: number; failed: number }> {
    this.logger.log('Manual trigger: running vaccination reminder job now...');
    await this.sendDailyReminders();
    return { sent: 0, failed: 0 };
  }
}
