import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Woreda, WoredaDocument } from './schemas/woreda.schema';
import { CreateWoredaDto } from './dto/create-woreda.dto';

@Injectable()
export class WoredasService {
  constructor(@InjectModel(Woreda.name) private woredaModel: Model<WoredaDocument>) {}

  async create(createWoredaDto: CreateWoredaDto): Promise<Woreda> {
    console.log('Creating woreda with data:', createWoredaDto);
    
    const existingWoreda = await this.woredaModel.findOne({ 
      name: createWoredaDto.name,
      city: createWoredaDto.city 
    });
    if (existingWoreda) {
      console.log('Woreda already exists:', existingWoreda);
      throw new ConflictException('Woreda with this name and city already exists');
    }

    const createdWoreda = new this.woredaModel(createWoredaDto);
    console.log('Woreda to save:', createdWoreda);
    
    try {
      const result = await createdWoreda.save();
      console.log('Woreda saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving woreda:', error);
      throw error;
    }
  }

  async findAll(): Promise<Woreda[]> {
    return this.woredaModel.find().exec();
  }

  async findById(id: string): Promise<Woreda> {
    return this.woredaModel.findById(id).exec();
  }

  async findAllWithRoleFilter(currentUser: any): Promise<Woreda[]> {
    const { role, assignedRegion, woredaId } = currentUser;

    if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN can see all woredas
      return this.woredaModel.find().exec();
    } else if (role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can see all woredas in their assigned region
      return this.woredaModel.find({ region: assignedRegion }).exec();
    } else if (role === 'WOREDA_ADMIN') {
      // WOREDA_ADMIN can see only their assigned woreda
      return this.woredaModel.find({ _id: woredaId }).exec();
    } else if (role === 'HOSPITAL_ADMIN') {
      // HOSPITAL_ADMIN can see only their woreda (where their hospital is located)
      return this.woredaModel.find({ _id: woredaId }).exec();
    }

    return [];
  }
}
