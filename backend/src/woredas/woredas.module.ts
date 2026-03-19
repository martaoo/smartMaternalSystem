import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Woreda, WoredaSchema } from './schemas/woreda.schema';
import { WoredasService } from './woredas.service';
import { WoredasController } from './woredas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Woreda.name, schema: WoredaSchema }]),
  ],
  controllers: [WoredasController],
  providers: [WoredasService],
  exports: [WoredasService],
})
export class WoredasModule {}
