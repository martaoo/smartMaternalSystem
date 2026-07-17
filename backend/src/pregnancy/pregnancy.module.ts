import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PregnancyController } from './pregnancy.controller';
import { PregnancyService } from './pregnancy.service';
import { PregnancyReminderService } from './pregnancy-reminder.service';
import { AncScheduleService } from './anc-schedule.service';
import { Pregnancy, PregnancySchema } from './schemas/pregnancy.schema';
import { MaternalVaccine, MaternalVaccineSchema } from './schemas/maternal-vaccine.schema';
import { ReferralsModule } from '@/referrals/referrals.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pregnancy.name, schema: PregnancySchema },
      { name: MaternalVaccine.name, schema: MaternalVaccineSchema },
    ]),
    ReferralsModule,
    NotificationsModule,
  ],
  controllers: [PregnancyController],
  providers: [PregnancyService, PregnancyReminderService, AncScheduleService],
  exports: [PregnancyService, PregnancyReminderService, AncScheduleService],
})
export class PregnancyModule {}
