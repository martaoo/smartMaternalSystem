import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Woreda, WoredaDocument } from './schemas/woreda.schema';
import { CreateWoredaDto } from './dto/create-woreda.dto';

@Injectable()
export class WoredasService {
  constructor(@InjectModel(Woreda.name) private woredaModel: Model<WoredaDocument>) {}

  async create(createWoredaDto: CreateWoredaDto): Promise<Woreda> {
    const existingWoreda = await this.woredaModel.findOne({ name: createWoredaDto.name });
    if (existingWoreda) {
      throw new ConflictException('Woreda with this name already exists');
    }

    const createdWoreda = new this.woredaModel(createWoredaDto);
    return createdWoreda.save();
  }

  async findAll(): Promise<Woreda[]> {
    return this.woredaModel.find().exec();
  }

  async findAllWithRoleFilter(role: string, woredaId?: string): Promise<Woreda[]> {
    if (role === 'HOSPITAL_ADMIN' && woredaId) {
      return this.woredaModel.find({ _id: woredaId }).exec();
    }
    return this.woredaModel.find().exec();
  }
}
