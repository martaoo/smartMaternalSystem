import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pregnancy, PregnancyDocument } from './schemas/pregnancy.schema';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { ReferralsService } from '@/referrals/referrals.service';

@Injectable()
export class PregnancyService {
  constructor(
    @InjectModel(Pregnancy.name)
    private pregnancyModel: Model<PregnancyDocument>,
    private referralService: ReferralsService,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(
    createPregnancyDto: CreatePregnancyDto,
    userRole: string,
    userHospitalId?: string,
    userId?: string,
  ): Promise<Pregnancy> {
    if (!createPregnancyDto.motherId) {
      throw new BadRequestException('motherId is required');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!userHospitalId) {
      throw new BadRequestException('Hospital ID is required');
    }

    const pregnancy = await new this.pregnancyModel({
      ...createPregnancyDto,
      motherId: new Types.ObjectId(createPregnancyDto.motherId),
      healthWorkerId: new Types.ObjectId(userId),
      hospitalId: new Types.ObjectId(userHospitalId),
      nextVisitDate: createPregnancyDto.nextVisitDate
        ? new Date(createPregnancyDto.nextVisitDate)
        : undefined,
    }).save();

    await this.triggerReferralIfNeeded(
      pregnancy,
      userId,
      userHospitalId,
    );

    return pregnancy;
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: string,
    updatePregnancyDto: any,
    userRole: string,
    userHospitalId?: string,
    userId?: string,
  ): Promise<Pregnancy> {
    await this.findById(id, userRole, userHospitalId);

    const updateData: any = { ...updatePregnancyDto };

    if (updateData.motherId) {
      updateData.motherId = new Types.ObjectId(updateData.motherId);
    }

    if (updateData.nextVisitDate) {
      updateData.nextVisitDate = new Date(updateData.nextVisitDate);
    }

    const updated = await this.pregnancyModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('motherId', 'name phone age address')
      .populate('healthWorkerId', 'name email role')
      .populate('hospitalId', 'name type')
      .exec();

    await this.triggerReferralIfNeeded(
      updated,
      userId,
      userHospitalId,
    );

    return updated;
  }

  // =========================
  // REFERRAL TRIGGER
  // =========================
  private async triggerReferralIfNeeded(
    pregnancy: Pregnancy,
    userId?: string,
    hospitalId?: string,
  ) {
    if (!pregnancy) return;
    if (!userId || !hospitalId) return;

    if (pregnancy.riskLevel !== 'HIGH' && !pregnancy.emergency)
      return;

    try {
      const motherId = pregnancy.motherId.toString();

      await this.referralService.createReferral(
        {
          motherId,
          reason: pregnancy.emergency
            ? 'Emergency pregnancy case'
            : 'High-risk pregnancy',
          priority: pregnancy.emergency ? 'URGENT' : 'HIGH',
        } as any,
        userId,
        hospitalId,
        'Auto Referral System',
      );
    } catch (error) {
      console.error('Referral trigger failed:', error.message);
    }
  }

  // =========================
  // FIND BY MOTHER
  // =========================
  async findByMotherId(
    motherId: string,
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ): Promise<Pregnancy[]> {
    const pregnancies = await this.pregnancyModel
      .find({ motherId: new Types.ObjectId(motherId) })
      .populate('motherId', 'name phone age address')
      .populate('healthWorkerId', 'name email role')
      .populate('hospitalId', 'name type')
      .sort({ visitDate: -1 })
      .exec();

    return this.filterPregnanciesByRole(
      pregnancies,
      userRole,
      userHospitalId,
      userWoredaId,
    );
  }

  // =========================
  // FIND ALL
  // =========================
  async findAll(
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ): Promise<Pregnancy[]> {
    let query: any = {};

    if (
      ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE'].includes(
        userRole,
      )
    ) {
      query.hospitalId = new Types.ObjectId(userHospitalId);
    }

    const pregnancies = await this.pregnancyModel
      .find(query)
      .populate('motherId', 'name phone age address')
      .populate('healthWorkerId', 'name email role')
      .populate('hospitalId', 'name type')
      .sort({ visitDate: -1 })
      .exec();

    return pregnancies;
  }

  async findById(id: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Pregnancy> {
    const pregnancy = await this.pregnancyModel.findById(id)
      .populate('motherId', 'name phone age address healthCenter woredaId')
      .populate('healthWorkerId', 'name email role phone')
      .populate('hospitalId', 'name type address')
      .exec();

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy record not found');
    }

    console.log('=== PREGNANCY FIND DEBUG ===');
    console.log('Pregnancy ID:', id);
    console.log('User role:', userRole);
    console.log('User hospitalId:', userHospitalId);
    console.log('User hospitalId type:', typeof userHospitalId);
    console.log('Pregnancy hospitalId:', pregnancy.hospitalId);
    console.log('Pregnancy hospitalId type:', typeof pregnancy.hospitalId);
    console.log('Mother healthCenter:', (pregnancy.motherId as any).healthCenter);
    
    // Check access permissions with fallback logic
    const filtered = await this.filterPregnanciesByRole([pregnancy], userRole, userHospitalId, userWoredaId);
    
    if (filtered.length === 0) {
      // Fallback: Check if user can access the mother (more permissive)
      if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
        const mother = pregnancy.motherId as any;
        if (mother && mother.healthCenter) {
          const motherHospitalId = mother.healthCenter.toString();
          const userHospitalIdStr = userHospitalId?.toString();
          
          console.log('Fallback check - Mother hospital:', motherHospitalId);
          console.log('Fallback check - User hospital:', userHospitalIdStr);
          
          if (motherHospitalId === userHospitalIdStr) {
            console.log('Access granted via mother hospital match');
            return pregnancy;
          }
        }
      }
      
      throw new NotFoundException('Pregnancy record not found or access denied');
    }

    return pregnancy;
  }

  async delete(
    id: string,
    userRole: string,
    userHospitalId?: string,
  ): Promise<void> {
    await this.findById(id, userRole, userHospitalId);
    await this.pregnancyModel.findByIdAndDelete(id);
  }

  // =========================
  // HIGH RISK
  // =========================
  async getHighRiskPregnancies(
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ): Promise<Pregnancy[]> {
    const pregnancies = await this.findAll(
      userRole,
      userHospitalId,
      userWoredaId,
    );

    return pregnancies.filter(
      (p) => p.riskLevel === 'HIGH' || p.emergency,
    );
  }

  // =========================
  // STATS
  // =========================
  async getPregnancyStats(
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ) {
    const pregnancies = await this.findAll(
      userRole,
      userHospitalId,
      userWoredaId,
    );

    return {
      total: pregnancies.length,
      highRisk: pregnancies.filter((p) => p.riskLevel === 'HIGH')
        .length,
      moderateRisk: pregnancies.filter(
        (p) => p.riskLevel === 'MODERATE',
      ).length,
      lowRisk: pregnancies.filter((p) => p.riskLevel === 'LOW')
        .length,
      emergencies: pregnancies.filter((p) => p.emergency).length,
    };
  }

  // =========================
  // UPCOMING VISITS
  // =========================
  async getUpcomingVisits(
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ): Promise<Pregnancy[]> {
    const pregnancies = await this.findAll(
      userRole,
      userHospitalId,
      userWoredaId,
    );

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return pregnancies
      .filter(
        (p) =>
          p.nextVisitDate &&
          p.nextVisitDate >= today &&
          p.nextVisitDate <= nextWeek,
      )
      .sort(
        (a, b) =>
          a.nextVisitDate.getTime() - b.nextVisitDate.getTime(),
      );
  }

  // =========================
  // ROLE FILTER
  // =========================
  private async filterPregnanciesByRole(
    pregnancies: Pregnancy[],
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ): Promise<Pregnancy[]> {
    console.log('=== PREGNANCY FILTER DEBUG ===');
    console.log('User role:', userRole);
    console.log('User hospitalId:', userHospitalId);
    console.log('User hospitalId type:', typeof userHospitalId);
    console.log('Pregnancies to filter:', pregnancies.length);
    
    if (userRole === 'SUPER_ADMIN' || userRole === 'SYSTEM_ADMIN') {
      console.log('Admin access granted - returning all pregnancies');
      return pregnancies;
    }

    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      if (!userHospitalId) {
        console.log('No user hospitalId provided for hospital staff');
        return [];
      }
      
      const filtered = pregnancies.filter(p => {
        let pregnancyHospitalId: string;
        
        // Handle both ObjectId and populated object cases
        if (p.hospitalId) {
          if (typeof p.hospitalId === 'object' && p.hospitalId._id) {
            // Populated object case
            pregnancyHospitalId = p.hospitalId._id.toString();
          } else {
            // ObjectId case
            pregnancyHospitalId = p.hospitalId.toString();
          }
        } else {
          console.log('Pregnancy has no hospitalId');
          return false;
        }
        
        const userHospitalIdStr = userHospitalId.toString();
        const matches = pregnancyHospitalId === userHospitalIdStr;
        
        console.log('Pregnancy hospitalId:', pregnancyHospitalId);
        console.log('Pregnancy hospitalId raw:', p.hospitalId);
        console.log('User hospitalId:', userHospitalIdStr);
        console.log('Match:', matches);
        
        return matches;
      });
      
      console.log('Filtered pregnancies count:', filtered.length);
      return filtered;
    }

    if (userRole === 'WOREDA_ADMIN') {
      // Filter by woreda through mother relationship
      const filtered = pregnancies.filter(p => 
        p.motherId && (p.motherId as any).woredaId?.toString() === userWoredaId
      );
      console.log('Woreda admin filtered pregnancies count:', filtered.length);
      return filtered;
    }

    console.log('No access granted for role:', userRole);
    return [];
  }
}