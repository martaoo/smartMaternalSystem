import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hospital, HospitalDocument } from './schemas/hospital.schema';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { WoredasService } from '../woredas/woredas.service';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    private woredasService: WoredasService
  ) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const existingHospital = await this.hospitalModel.findOne({ name: createHospitalDto.name });
    if (existingHospital) {
      throw new ConflictException('Hospital with this name already exists');
    }

    const createdHospital = new this.hospitalModel(createHospitalDto);
    return createdHospital.save();
  }

  async createWithRoleValidation(createHospitalDto: CreateHospitalDto, currentUser: any): Promise<Hospital> {
    const { role, assignedRegion, woredaId } = currentUser;

    // SUPER_ADMIN can create hospitals anywhere
    if (role === 'SUPER_ADMIN') {
      // Validate woreda exists
      const woreda = await this.woredasService.findById(createHospitalDto.woredaId.toString());
      if (!woreda) {
        throw new ForbiddenException('Woreda not found');
      }
      return this.create(createHospitalDto);
    }

    // SYSTEM_ADMIN can create hospitals only in their assigned region
    if (role === 'SYSTEM_ADMIN') {
      const woreda = await this.woredasService.findById(createHospitalDto.woredaId.toString());
      if (!woreda) {
        throw new ForbiddenException('Woreda not found');
      }
      if (woreda.region !== assignedRegion) {
        throw new ForbiddenException('System Admin can only create hospitals in their assigned region');
      }
      return this.create(createHospitalDto);
    }

    // WOREDA_ADMIN can create hospitals only in their assigned woreda
    if (role === 'WOREDA_ADMIN') {
      // Validate woreda exists
      const woreda = await this.woredasService.findById(createHospitalDto.woredaId.toString());
      if (!woreda) {
        throw new ForbiddenException('Woreda not found');
      }
      if (createHospitalDto.woredaId.toString() !== woredaId) {
        throw new ForbiddenException('Woreda Admin can only create hospitals in their assigned woreda');
      }
      return this.create(createHospitalDto);
    }

    throw new ForbiddenException('Insufficient permissions to create hospitals');
  }

  async findAll(): Promise<Hospital[]> {
    return this.hospitalModel.find().populate('woredaId').exec();
  }

  async findById(id: string): Promise<Hospital> {
    return this.hospitalModel.findById(id).exec();
  }

  async findAllWithRoleFilter(currentUser: any): Promise<Hospital[]> {
    const { role, assignedRegion, woredaId, hospitalId } = currentUser;

    if (role === 'SUPER_ADMIN') {
      return this.hospitalModel.find().populate('woredaId').exec();
    } else if (role === 'SYSTEM_ADMIN') {
      return this.hospitalModel.find().populate({
        path: 'woredaId',
        match: { region: assignedRegion }
      }).exec();
    } else if (role === 'WOREDA_ADMIN') {
      return this.hospitalModel.find({ woredaId }).populate('woredaId').exec();
    } else if (role === 'HOSPITAL_ADMIN') {
      return this.hospitalModel.find({ _id: hospitalId }).populate('woredaId').exec();
    }

    return [];
  }
}
