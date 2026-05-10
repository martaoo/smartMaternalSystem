import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MothersController } from './mothers.controller';
import { MothersService } from './mothers.service';
import { Mother, MotherSchema } from './schemas/mother.schema';
import { HospitalsModule } from '../hospitals/hospitals.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mother.name, schema: MotherSchema }]),
    HospitalsModule,
  ],
  controllers: [MothersController],
  providers: [MothersService],
  exports: [MothersService],
})
export class MothersModule {}
