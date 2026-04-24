import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PregnancyController } from './pregnancy.controller';
import { PregnancyService } from './pregnancy.service';
import { Pregnancy, PregnancySchema } from './schemas/pregnancy.schema';
import { ReferralsModule } from '@/referrals/referrals.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pregnancy.name, schema: PregnancySchema }]),
    ReferralsModule
  ],
  controllers: [PregnancyController],
  providers: [PregnancyService],
  exports: [PregnancyService],
})
export class PregnancyModule {}
