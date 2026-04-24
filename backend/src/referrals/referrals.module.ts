import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import { Notification, NotificationSchema } from './schemas/notfiationSchema.schema';
import { NotificationService } from './notification.service';
import { MothersService } from '@/mothers/mothers.service';
import { Mother,MotherSchema } from '@/mothers/schemas/mother.schema';
import { Hospital, HospitalSchema } from 'src/hospitals/schemas/hospital.schema';
import { MothersModule } from '@/mothers/mothers.module';

@Module({
  imports:[MongooseModule.forFeature([{name:Referral.name,schema:ReferralSchema},{name:Notification.name,schema:NotificationSchema},{name:Mother.name,schema:MotherSchema},{name:Hospital.name,schema:HospitalSchema}]),MothersModule],
  providers: [ReferralsService,NotificationService,MothersService],
  controllers: [ReferralsController],
  exports: [ReferralsService],
})
export class ReferralsModule {}
