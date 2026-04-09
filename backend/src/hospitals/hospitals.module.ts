import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital, HospitalSchema } from './schemas/hospital.schema';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { WoredasModule } from '../woredas/woredas.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }]),
    WoredasModule,
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}
