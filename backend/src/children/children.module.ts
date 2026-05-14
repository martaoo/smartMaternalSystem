import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child, ChildSchema } from './schemas/child.schema';
import { GrowthRecord, GrowthRecordSchema } from './schemas/growth-record.schema';
import { Hospital, HospitalSchema } from '../hospitals/schemas/hospital.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Child.name, schema: ChildSchema },
      { name: GrowthRecord.name, schema: GrowthRecordSchema },
      { name: Hospital.name, schema: HospitalSchema }
    ])
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
