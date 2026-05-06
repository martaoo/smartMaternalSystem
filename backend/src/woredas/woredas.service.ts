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
    return this.woredaModel.find().populate('regionId').exec();
  }

  async findById(id: string): Promise<Woreda | null> {
    return this.woredaModel.findById(id).populate('regionId').exec();
  }

  async findAllWithRoleFilter(role: string, woredaId?: string, regionId?: string): Promise<Woreda[]> {
    // SYSTEM_ADMIN can see all woredas
    if (role === 'SYSTEM_ADMIN' || role === 'MOH_ADMIN') {
      return this.woredaModel.find().exec();
    }
    
    // WOREDA_ADMIN can only see their woreda
    if (role === 'WOREDA_ADMIN' && woredaId) {
      return this.woredaModel.find({ _id: woredaId }).populate('regionId').exec();
    }
    
    // HOSPITAL_ADMIN - check if they have woredaId
    if ((role === 'HOSPITAL_ADMIN' || role === 'HEALTH_CENTER_ADMIN')) {
      if (woredaId) {
        return this.woredaModel.find({ _id: woredaId }).exec();
      }
      // If no woredaId, return empty array or all? Usually empty for security
      return [];
    }
    
    // Default: return all for other roles (like DOCTOR, NURSE)
    if (role === 'SYSTEM_ADMIN' && regionId) {
      const woredas = await this.woredaModel.find().populate('regionId').exec();
      return woredas.filter((w: any) => {
        const woredaRegion = w.regionId && typeof w.regionId === 'object' ? (w.regionId as any)._id : w.regionId;
        return woredaRegion?.toString() === regionId;
      });
    }
    return this.woredaModel.find().populate('regionId').exec();
  }

  async update(id: string, updateWoredaDto: any): Promise<Woreda> {
    const woreda = await this.woredaModel.findById(id);
    if (!woreda) {
      throw new ConflictException('Woreda not found');
    }
    Object.assign(woreda, updateWoredaDto);
    return woreda.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.woredaModel.findByIdAndDelete(id);
    if (!result) {
      throw new ConflictException('Woreda not found');
    }
  }
}
