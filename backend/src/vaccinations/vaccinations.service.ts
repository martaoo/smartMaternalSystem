import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vaccine, VaccineDocument } from './schemas/vaccine.schema';
import { VaccinationRecord, VaccinationRecordDocument } from './schemas/vaccination-record.schema';
import { ChildrenService } from '../children/children.service';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectModel(Vaccine.name) private vaccineModel: Model<VaccineDocument>,
    @InjectModel(VaccinationRecord.name) private vaccinationRecordModel: Model<VaccinationRecordDocument>,
    private readonly childrenService: ChildrenService
  ) {}

  // Vaccine Management
  async createVaccine(createVaccineDto: any): Promise<Vaccine> {
    const vaccine = new this.vaccineModel(createVaccineDto);
    return vaccine.save();
  }

  async findAllVaccines(): Promise<Vaccine[]> {
    return this.vaccineModel.find({ isActive: true }).sort({ category: 1, recommendedAgeWeeks: 1 }).exec();
  }

  async findVaccineById(id: string): Promise<Vaccine> {
    const vaccine = await this.vaccineModel.findById(id).exec();
    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }
    return vaccine;
  }

  async updateVaccine(id: string, updateVaccineDto: any): Promise<Vaccine> {
    await this.findVaccineById(id);
    return this.vaccineModel.findByIdAndUpdate(id, updateVaccineDto, { new: true }).exec();
  }

  async deleteVaccine(id: string): Promise<void> {
    await this.findVaccineById(id);
    await this.vaccineModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async getVaccinesByCategory(category: string): Promise<Vaccine[]> {
    return this.vaccineModel.find({ category, isActive: true }).sort({ recommendedAgeWeeks: 1 }).exec();
  }

  // Vaccination Records Management
  async createVaccinationRecord(createVaccinationRecordDto: any, userRole: string, userHospitalId?: string, userId?: string): Promise<VaccinationRecord> {
    // Validate access to child
    await this.childrenService.findById(createVaccinationRecordDto.childId, userRole, userHospitalId);
    
    // Validate vaccine exists
    await this.findVaccineById(createVaccinationRecordDto.vaccineId);

    const recordData = {
      ...createVaccinationRecordDto,
      childId: new Types.ObjectId(createVaccinationRecordDto.childId),
      vaccineId: new Types.ObjectId(createVaccinationRecordDto.vaccineId),
      createdBy: new Types.ObjectId(userId),
      createdAtHospital: new Types.ObjectId(userHospitalId),
      scheduledDate: new Date(createVaccinationRecordDto.scheduledDate),
      administeredDate: createVaccinationRecordDto.administeredDate ? new Date(createVaccinationRecordDto.administeredDate) : undefined,
      expiryDate: createVaccinationRecordDto.expiryDate ? new Date(createVaccinationRecordDto.expiryDate) : undefined,
      followUpDate: createVaccinationRecordDto.followUpDate ? new Date(createVaccinationRecordDto.followUpDate) : undefined,
      originalScheduleDate: createVaccinationRecordDto.originalScheduleDate ? new Date(createVaccinationRecordDto.originalScheduleDate) : undefined,
    };

    const record = new this.vaccinationRecordModel(recordData);
    return record.save();
  }

  async getVaccinationRecordsByChildId(childId: string, userRole: string, userHospitalId?: string): Promise<VaccinationRecord[]> {
    await this.childrenService.findById(childId, userRole, userHospitalId);

    return this.vaccinationRecordModel.find({ childId: new Types.ObjectId(childId) })
      .populate('vaccineId', 'name code description category recommendedAge')
      .populate('administeredBy', 'name email role')
      .populate('administeredAt', 'name type address')
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async getVaccinationRecordsByStatus(status: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<VaccinationRecord[]> {
    let query: any = { status };

    // Apply role-based filtering
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      query.createdAtHospital = new Types.ObjectId(userHospitalId);
    }

    const records = await this.vaccinationRecordModel.find(query)
      .populate('childId', 'name birthDate gender')
      .populate('vaccineId', 'name code category recommendedAge')
      .populate('administeredBy', 'name email role')
      .populate('administeredAt', 'name type')
      .sort({ scheduledDate: 1 })
      .exec();

    // Additional filtering for Woreda Admin
    if (userRole === 'WOREDA_ADMIN') {
      const filteredRecords = [];
      for (const record of records) {
        try {
          await this.childrenService.findById(record.childId._id.toString(), userRole, undefined, userWoredaId);
          filteredRecords.push(record);
        } catch (error) {
          // Skip records for children not in this woreda
        }
      }
      return filteredRecords;
    }

    return records;
  }

  async getUpcomingVaccinations(userRole: string, userHospitalId?: string, userWoredaId?: string, daysAhead: number = 30): Promise<VaccinationRecord[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    let query: any = {
      scheduledDate: { $gte: today, $lte: futureDate },
      status: { $in: ['SCHEDULED', 'DEFERRED'] }
    };

    // Apply role-based filtering
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      query.createdAtHospital = new Types.ObjectId(userHospitalId);
    }

    const records = await this.vaccinationRecordModel.find(query)
      .populate('childId', 'name birthDate gender')
      .populate('vaccineId', 'name code category recommendedAge')
      .populate('administeredBy', 'name email role')
      .sort({ scheduledDate: 1 })
      .exec();

    // Additional filtering for Woreda Admin
    if (userRole === 'WOREDA_ADMIN') {
      const filteredRecords = [];
      for (const record of records) {
        try {
          await this.childrenService.findById(record.childId._id.toString(), userRole, undefined, userWoredaId);
          filteredRecords.push(record);
        } catch (error) {
          // Skip records for children not in this woreda
        }
      }
      return filteredRecords;
    }

    return records;
  }

  async getOverdueVaccinations(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<VaccinationRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    let query: any = {
      scheduledDate: { $lt: today },
      status: { $in: ['SCHEDULED', 'DEFERRED'] }
    };

    // Apply role-based filtering
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      query.createdAtHospital = new Types.ObjectId(userHospitalId);
    }

    const records = await this.vaccinationRecordModel.find(query)
      .populate('childId', 'name birthDate gender')
      .populate('vaccineId', 'name code category recommendedAge')
      .populate('administeredBy', 'name email role')
      .sort({ scheduledDate: 1 })
      .exec();

    // Additional filtering for Woreda Admin
    if (userRole === 'WOREDA_ADMIN') {
      const filteredRecords = [];
      for (const record of records) {
        try {
          await this.childrenService.findById(record.childId._id.toString(), userRole, undefined, userWoredaId);
          filteredRecords.push(record);
        } catch (error) {
          // Skip records for children not in this woreda
        }
      }
      return filteredRecords;
    }

    return records;
  }

  async updateVaccinationRecord(id: string, updateVaccinationRecordDto: any, userRole: string, userHospitalId?: string): Promise<VaccinationRecord> {
    const record = await this.vaccinationRecordModel.findById(id).exec();
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }

    // Check access through child
    await this.childrenService.findById(record.childId.toString(), userRole, userHospitalId);

    const updateData: any = { ...updateVaccinationRecordDto };
    if (updateVaccinationRecordDto.childId) {
      updateData.childId = new Types.ObjectId(updateVaccinationRecordDto.childId);
    }
    if (updateVaccinationRecordDto.vaccineId) {
      updateData.vaccineId = new Types.ObjectId(updateVaccinationRecordDto.vaccineId);
    }
    if (updateVaccinationRecordDto.scheduledDate) {
      updateData.scheduledDate = new Date(updateVaccinationRecordDto.scheduledDate);
    }
    if (updateVaccinationRecordDto.administeredDate) {
      updateData.administeredDate = new Date(updateVaccinationRecordDto.administeredDate);
    }
    if (updateVaccinationRecordDto.expiryDate) {
      updateData.expiryDate = new Date(updateVaccinationRecordDto.expiryDate);
    }
    if (updateVaccinationRecordDto.followUpDate) {
      updateData.followUpDate = new Date(updateVaccinationRecordDto.followUpDate);
    }

    return this.vaccinationRecordModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('vaccineId', 'name code description category recommendedAge')
      .populate('administeredBy', 'name email role')
      .populate('administeredAt', 'name type')
      .exec();
  }

  async deleteVaccinationRecord(id: string, userRole: string, userHospitalId?: string): Promise<void> {
    const record = await this.vaccinationRecordModel.findById(id).exec();
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }

    // Check access through child
    await this.childrenService.findById(record.childId.toString(), userRole, userHospitalId);
    
    await this.vaccinationRecordModel.findByIdAndDelete(id);
  }

  // Vaccination Schedule Generation
  async generateVaccinationSchedule(childId: string, userRole: string, userHospitalId?: string): Promise<VaccinationRecord[]> {
    const child = await this.childrenService.findById(childId, userRole, userHospitalId);
    const vaccines = await this.findAllVaccines();
    const schedule: VaccinationRecord[] = [];

    for (const vaccine of vaccines) {
      for (let dose = 1; dose <= vaccine.dosesRequired; dose++) {
        const ageWeeks = vaccine.recommendedAgeWeeks + ((dose - 1) * vaccine.intervalWeeks);
        const scheduledDate = new Date(child.birthDate);
        scheduledDate.setDate(scheduledDate.getDate() + (ageWeeks * 7));

        // Check if this schedule already exists
        const existing = await this.vaccinationRecordModel.findOne({
          childId: new Types.ObjectId(childId),
          vaccineId: (vaccine as any)._id,
          doseNumber: dose
        }).exec();

        if (!existing) {
          const record = new this.vaccinationRecordModel({
            childId: new Types.ObjectId(childId),
            vaccineId: (vaccine as any)._id,
            doseNumber: dose,
            scheduledDate,
            status: 'SCHEDULED',
            createdBy: new Types.ObjectId('SYSTEM'), // This would be the current user in real implementation
            createdAtHospital: new Types.ObjectId(userHospitalId),
          });
          schedule.push(await record.save());
        }
      }
    }

    return schedule;
  }

  async getVaccinationStats(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<any> {
    const scheduled = await this.getVaccinationRecordsByStatus('SCHEDULED', userRole, userHospitalId, userWoredaId);
    const administered = await this.getVaccinationRecordsByStatus('ADMINISTERED', userRole, userHospitalId, userWoredaId);
    const missed = await this.getVaccinationRecordsByStatus('MISSED', userRole, userHospitalId, userWoredaId);
    const deferred = await this.getVaccinationRecordsByStatus('DEFERRED', userRole, userHospitalId, userWoredaId);

    const upcoming = await this.getUpcomingVaccinations(userRole, userHospitalId, userWoredaId);
    const overdue = await this.getOverdueVaccinations(userRole, userHospitalId, userWoredaId);

    return {
      total: scheduled.length + administered.length + missed.length + deferred.length,
      scheduled: scheduled.length,
      administered: administered.length,
      missed: missed.length,
      deferred: deferred.length,
      upcoming: upcoming.length,
      overdue: overdue.length,
      coverageRate: administered.length / (administered.length + scheduled.length + missed.length) * 100
    };
  }

  async markVaccinationAdministered(id: string, administrationData: any, userRole: string, userHospitalId?: string, userId?: string): Promise<VaccinationRecord> {
    const updateData = {
      ...administrationData,
      status: 'ADMINISTERED',
      administeredDate: new Date(),
      administeredBy: new Types.ObjectId(userId),
      administeredAt: new Types.ObjectId(userHospitalId),
    };

    return this.updateVaccinationRecord(id, updateData, userRole, userHospitalId);
  }

  async markVaccinationMissed(id: string, missReason: string, userRole: string, userHospitalId?: string): Promise<VaccinationRecord> {
    return this.updateVaccinationRecord(id, {
      status: 'MISSED',
      missReason
    }, userRole, userHospitalId);
  }

  async deferVaccination(id: string, deferReason: string, newScheduledDate: string, userRole: string, userHospitalId?: string): Promise<VaccinationRecord> {
    return this.updateVaccinationRecord(id, {
      status: 'DEFERRED',
      deferReason,
      scheduledDate: new Date(newScheduledDate),
      originalScheduleDate: new Date() // Store the original date
    }, userRole, userHospitalId);
  }
}
