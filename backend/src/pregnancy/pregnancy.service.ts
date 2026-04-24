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

  // =========================
  // FIND BY ID
  // =========================
  async findById(
    id: string,
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string,
  ): Promise<Pregnancy> {
    const pregnancy = await this.pregnancyModel
      .findById(id)
      .populate('motherId', 'name phone age address healthCenter')
      .populate('healthWorkerId', 'name email role phone')
      .populate('hospitalId', 'name type address')
      .exec();

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy record not found');
    }

    const allowed = await this.filterPregnanciesByRole(
      [pregnancy],
      userRole,
      userHospitalId,
      userWoredaId,
    );

    if (!allowed.length) {
      throw new NotFoundException('Access denied');
    }

    return pregnancy;
  }

  // =========================
  // DELETE
  // =========================
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
    if (['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(userRole)) {
      return pregnancies;
    }

    if (
      ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE'].includes(
        userRole,
      )
    ) {
      return pregnancies.filter(
        (p) => p.hospitalId.toString() === userHospitalId,
      );
    }

    return [];
  }
}