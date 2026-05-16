import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MothersController } from './mothers.controller';
import { MothersService } from './mothers.service';
import { Mother, MotherSchema } from './schemas/mother.schema';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mother.name, schema: MotherSchema }]),
    HospitalsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [MothersController],
  providers: [MothersService],
  exports: [MothersService],
})
export class MothersModule {}
