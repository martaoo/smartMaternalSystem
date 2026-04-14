import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pregnancy, PregnancyDocument } from './schemas/pregnancy.schema';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';

@Injectable()
export class PregnancyService {
  constructor(@InjectModel(Pregnancy.name) private pregnancyModel: Model<PregnancyDocument>) {}

  async create(createPregnancyDto: CreatePregnancyDto, userRole: string, userHospitalId?: string, userId?: string): Promise<Pregnancy> {
    // Validate access to mother
    const pregnancyData = {
      ...createPregnancyDto,
      motherId: new Types.ObjectId(createPregnancyDto.motherId),
      healthWorkerId: new Types.ObjectId(userId),
      hospitalId: new Types.ObjectId(userHospitalId),
      nextVisitDate: createPregnancyDto.nextVisitDate ? new Date(createPregnancyDto.nextVisitDate) : undefined,
    };

    const pregnancy = new this.pregnancyModel(pregnancyData);
    return pregnancy.save();
  }

  async findByMotherId(motherId: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Pregnancy[]> {
    const query: any = { motherId: new Types.ObjectId(motherId) };

    const pregnancies = await this.pregnancyModel.find(query)
      .populate('motherId', 'name phone age address')
      .populate('healthWorkerId', 'name email role')
      .populate('hospitalId', 'name type')
      .sort({ visitDate: -1 })
      .exec();

    // Apply role-based access control
    return this.filterPregnanciesByRole(pregnancies, userRole, userHospitalId, userWoredaId);
  }

  async findAll(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Pregnancy[]> {
    let query: any = {};

    // Apply role-based filtering
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      query.hospitalId = new Types.ObjectId(userHospitalId);
    } else if (userRole === 'WOREDA_ADMIN') {
      // Need to join with mothers to filter by woreda
      const pregnancies = await this.pregnancyModel.find(query)
        .populate('motherId')
        .populate('healthWorkerId', 'name email role')
        .populate('hospitalId', 'name type')
        .sort({ visitDate: -1 })
        .exec();

      return pregnancies.filter(p => 
        p.motherId && (p.motherId as any).woredaId?.toString() === userWoredaId
      );
    }

    const pregnancies = await this.pregnancyModel.find(query)
      .populate('motherId', 'name phone age address')
      .populate('healthWorkerId', 'name email role')
      .populate('hospitalId', 'name type')
      .sort({ visitDate: -1 })
      .exec();

    return pregnancies;
  }

  async findById(id: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Pregnancy> {
    const pregnancy = await this.pregnancyModel.findById(id)
      .populate('motherId', 'name phone age address healthCenter')
      .populate('healthWorkerId', 'name email role phone')
      .populate('hospitalId', 'name type address')
      .exec();

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy record not found');
    }

    // Check access permissions
    const filtered = await this.filterPregnanciesByRole([pregnancy], userRole, userHospitalId, userWoredaId);
    if (filtered.length === 0) {
      throw new NotFoundException('Pregnancy record not found or access denied');
    }

    return pregnancy;
  }

  async update(id: string, updatePregnancyDto: any, userRole: string, userHospitalId?: string): Promise<Pregnancy> {
    await this.findById(id, userRole, userHospitalId);

    const updateData: any = { ...updatePregnancyDto };
    if (updatePregnancyDto.motherId) {
      updateData.motherId = new Types.ObjectId(updatePregnancyDto.motherId);
    }
    if (updatePregnancyDto.nextVisitDate) {
      updateData.nextVisitDate = new Date(updatePregnancyDto.nextVisitDate);
    }

    return this.pregnancyModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('motherId', 'name phone age address')
      .populate('healthWorkerId', 'name email role')
      .populate('hospitalId', 'name type')
      .exec();
  }

  async delete(id: string, userRole: string, userHospitalId?: string): Promise<void> {
    await this.findById(id, userRole, userHospitalId);
    await this.pregnancyModel.findByIdAndDelete(id);
  }

  async getHighRiskPregnancies(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Pregnancy[]> {
    const pregnancies = await this.findAll(userRole, userHospitalId, userWoredaId);
    return pregnancies.filter(p => p.riskLevel === 'HIGH' || p.emergency);
  }

  async getPregnancyStats(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<any> {
    const pregnancies = await this.findAll(userRole, userHospitalId, userWoredaId);
    
    const total = pregnancies.length;
    const highRisk = pregnancies.filter(p => p.riskLevel === 'HIGH').length;
    const moderateRisk = pregnancies.filter(p => p.riskLevel === 'MODERATE').length;
    const lowRisk = pregnancies.filter(p => p.riskLevel === 'LOW').length;
    const emergencies = pregnancies.filter(p => p.emergency).length;

    return {
      total,
      highRisk,
      moderateRisk,
      lowRisk,
      emergencies,
      riskDistribution: {
        low: lowRisk,
        moderate: moderateRisk,
        high: highRisk
      }
    };
  }

  async getUpcomingVisits(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Pregnancy[]> {
    const pregnancies = await this.findAll(userRole, userHospitalId, userWoredaId);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return pregnancies.filter(p => 
      p.nextVisitDate && 
      p.nextVisitDate >= today && 
      p.nextVisitDate <= nextWeek
    ).sort((a, b) => a.nextVisitDate.getTime() - b.nextVisitDate.getTime());
  }

  private async filterPregnanciesByRole(
    pregnancies: Pregnancy[], 
    userRole: string, 
    userHospitalId?: string, 
    userWoredaId?: string
  ): Promise<Pregnancy[]> {
    if (userRole === 'SUPER_ADMIN' || userRole === 'SYSTEM_ADMIN') {
      return pregnancies;
    }

    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      return pregnancies.filter(p => p.hospitalId.toString() === userHospitalId);
    }

    if (userRole === 'WOREDA_ADMIN') {
      // Filter by woreda through mother relationship
      return pregnancies.filter(p => 
        p.motherId && (p.motherId as any).woredaId?.toString() === userWoredaId
      );
    }

    return [];
  }
}
