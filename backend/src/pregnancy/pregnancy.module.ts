import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PregnancyController } from './pregnancy.controller';
import { PregnancyService } from './pregnancy.service';
import { Pregnancy, PregnancySchema } from './schemas/pregnancy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pregnancy.name, schema: PregnancySchema }])
  ],
  controllers: [PregnancyController],
  providers: [PregnancyService],
  exports: [PregnancyService],
})
export class PregnancyModule {}
