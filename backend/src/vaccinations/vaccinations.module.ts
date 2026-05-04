import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { VaccinationReminderService } from './vaccination-reminder.service';
import { Vaccine, VaccineSchema } from './schemas/vaccine.schema';
import { VaccinationRecord, VaccinationRecordSchema } from './schemas/vaccination-record.schema';
import { ChildrenModule } from '../children/children.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vaccine.name, schema: VaccineSchema },
      { name: VaccinationRecord.name, schema: VaccinationRecordSchema },
    ]),
    ChildrenModule,
    NotificationsModule,
  ],
  controllers: [VaccinationsController],
  providers: [VaccinationsService, VaccinationReminderService],
  exports: [VaccinationsService, VaccinationReminderService],
})
export class VaccinationsModule {}
