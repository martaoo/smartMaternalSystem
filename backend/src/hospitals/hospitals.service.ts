import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './schemas/hospital.schema';
import { CreateHospitalDto } from './dto/create-hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(@InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const existingHospital = await this.hospitalModel.findOne({ name: createHospitalDto.name });
    if (existingHospital) {
      throw new ConflictException('Hospital with this name already exists');
    }

    const createdHospital = new this.hospitalModel(createHospitalDto);
    return createdHospital.save();
  }

  async findAll(): Promise<Hospital[]> {
    return this.hospitalModel.find().populate('woredaId').exec();
  }

  async findAllWithRoleFilter(role: string, hospitalId?: string): Promise<Hospital[]> {
    if (role === 'HOSPITAL_ADMIN' && hospitalId) {
      return this.hospitalModel.find({ _id: hospitalId }).populate('woredaId').exec();
    }
    return this.hospitalModel.find().populate('woredaId').exec();
  }
}
