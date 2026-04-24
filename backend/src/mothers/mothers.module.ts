import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MothersController } from './mothers.controller';
import { MothersService } from './mothers.service';
import { Mother, MotherSchema } from './schemas/mother.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mother.name, schema: MotherSchema }])
  ],
  controllers: [MothersController],
  providers: [MothersService],
  exports: [MothersService],
})
export class MothersModule {}
