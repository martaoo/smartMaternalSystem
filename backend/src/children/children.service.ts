import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Child, ChildDocument } from './schemas/child.schema';
import { GrowthRecord, GrowthRecordDocument } from './schemas/growth-record.schema';
import { CreateChildDto } from './dto/create-child.dto';
import { CreateGrowthRecordDto } from './dto/create-growth-record.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(GrowthRecord.name) private growthRecordModel: Model<GrowthRecordDocument>
  ) {}

  async create(createChildDto: CreateChildDto, userRole: string, userHospitalId?: string, userId?: string): Promise<Child> {
    // Validate hospital assignment based on user role
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      if (createChildDto.birthHospital !== userHospitalId) {
        throw new BadRequestException('You can only register children for your hospital');
      }
    }

    const childData = {
      ...createChildDto,
      birthDate: new Date(createChildDto.birthDate),
      birthHospital: new Types.ObjectId(createChildDto.birthHospital),
      motherId: new Types.ObjectId(createChildDto.motherId),
      deliveredBy: new Types.ObjectId(createChildDto.deliveredBy),
      assignedHealthWorker: createChildDto.assignedHealthWorker ? 
        new Types.ObjectId(createChildDto.assignedHealthWorker) : undefined,
    };

    const child = new this.childModel(childData);
    return child.save();
  }

  async findAll(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Child[]> {
    let query: any = {};

    // Filter based on user role
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      query.birthHospital = new Types.ObjectId(userHospitalId);
    } else if (userRole === 'WOREDA_ADMIN') {
      // Need to join with mothers to filter by woreda
      const children = await this.childModel.find(query)
        .populate('motherId')
        .populate('birthHospital', 'name type address')
        .populate('deliveredBy', 'name email role')
        .populate('assignedHealthWorker', 'name email role')
        .sort({ registrationDate: -1 })
        .exec();

      return children.filter(child => 
        child.motherId && (child.motherId as any).woredaId?.toString() === userWoredaId
      );
    }

    return this.childModel.find(query)
      .populate('motherId', 'name phone age address')
      .populate('birthHospital', 'name type address')
      .populate('deliveredBy', 'name email role')
      .populate('assignedHealthWorker', 'name email role')
      .sort({ registrationDate: -1 })
      .exec();
  }

  async findById(id: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Child> {
    const child = await this.childModel.findById(id)
      .populate('motherId', 'name phone age address healthCenter')
      .populate('birthHospital', 'name type address')
      .populate('deliveredBy', 'name email role phone')
      .populate('assignedHealthWorker', 'name email role phone')
      .exec();

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Check access permissions
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      if (child.birthHospital._id.toString() !== userHospitalId) {
        throw new NotFoundException('Child not found or access denied');
      }
    } else if (userRole === 'WOREDA_ADMIN') {
      if (child.motherId && (child.motherId as any).woredaId?.toString() !== userWoredaId) {
        throw new NotFoundException('Child not found or access denied');
      }
    }

    return child;
  }

  async findByMotherId(motherId: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Child[]> {
    const query: any = { motherId: new Types.ObjectId(motherId) };

    const children = await this.childModel.find(query)
      .populate('birthHospital', 'name type address')
      .populate('deliveredBy', 'name email role')
      .populate('assignedHealthWorker', 'name email role')
      .sort({ birthDate: -1 })
      .exec();

    // Apply role-based access control
    return this.filterChildrenByRole(children, userRole, userHospitalId, userWoredaId);
  }

  async update(id: string, updateChildDto: any, userRole: string, userHospitalId?: string): Promise<Child> {
    await this.findById(id, userRole, userHospitalId);

    const updateData: any = { ...updateChildDto };
    if (updateChildDto.birthHospital) {
      updateData.birthHospital = new Types.ObjectId(updateChildDto.birthHospital);
    }
    if (updateChildDto.motherId) {
      updateData.motherId = new Types.ObjectId(updateChildDto.motherId);
    }
    if (updateChildDto.assignedHealthWorker) {
      updateData.assignedHealthWorker = new Types.ObjectId(updateChildDto.assignedHealthWorker);
    }
    if (updateChildDto.birthDate) {
      updateData.birthDate = new Date(updateChildDto.birthDate);
    }
    if (updateChildDto.deathDate) {
      updateData.deathDate = new Date(updateChildDto.deathDate);
    }

    return this.childModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('motherId', 'name phone age address')
      .populate('birthHospital', 'name type address')
      .populate('deliveredBy', 'name email role')
      .populate('assignedHealthWorker', 'name email role')
      .exec();
  }

  async delete(id: string, userRole: string, userHospitalId?: string): Promise<void> {
    await this.findById(id, userRole, userHospitalId);
    await this.childModel.findByIdAndDelete(id);
  }

  async search(query: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Child[]> {
    let searchQuery: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'motherId.name': { $regex: query, $options: 'i' } },
        { 'motherId.phone': { $regex: query, $options: 'i' } }
      ]
    };

    // Apply role-based filtering
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      searchQuery.birthHospital = new Types.ObjectId(userHospitalId);
    }

    const children = await this.childModel.find(searchQuery)
      .populate('motherId', 'name phone age address')
      .populate('birthHospital', 'name type address')
      .populate('deliveredBy', 'name email role')
      .populate('assignedHealthWorker', 'name email role')
      .sort({ registrationDate: -1 })
      .exec();

    return this.filterChildrenByRole(children, userRole, userHospitalId, userWoredaId);
  }

  async getChildrenStats(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<any> {
    const children = await this.findAll(userRole, userHospitalId, userWoredaId);
    
    const total = children.length;
    const healthy = children.filter(c => c.healthStatus === 'HEALTHY').length;
    const needsAttention = children.filter(c => c.healthStatus === 'NEEDS_ATTENTION').length;
    const critical = children.filter(c => c.healthStatus === 'CRITICAL').length;
    const deceased = children.filter(c => c.deceased).length;

    // Age distribution
    const now = new Date();
    const ageGroups = {
      newborn: children.filter(c => {
        const age = now.getTime() - c.birthDate.getTime();
        return age < 28 * 24 * 60 * 60 * 1000; // < 28 days
      }).length,
      infant: children.filter(c => {
        const age = now.getTime() - c.birthDate.getTime();
        return age >= 28 * 24 * 60 * 60 * 1000 && age < 365 * 24 * 60 * 60 * 1000; // 28 days - 1 year
      }).length,
      toddler: children.filter(c => {
        const age = now.getTime() - c.birthDate.getTime();
        return age >= 365 * 24 * 60 * 60 * 1000 && age < 5 * 365 * 24 * 60 * 60 * 1000; // 1-5 years
      }).length,
    };

    return {
      total,
      healthy,
      needsAttention,
      critical,
      deceased,
      ageGroups,
      healthStatusDistribution: {
        healthy,
        needsAttention,
        critical
      }
    };
  }

  // Growth Record Methods
  async createGrowthRecord(createGrowthRecordDto: CreateGrowthRecordDto, userRole: string, userHospitalId?: string, userId?: string): Promise<GrowthRecord> {
    // Validate access to child
    const child = await this.findById(createGrowthRecordDto.childId, userRole, userHospitalId);
    
    const growthData = {
      ...createGrowthRecordDto,
      childId: new Types.ObjectId(createGrowthRecordDto.childId),
      measuredBy: new Types.ObjectId(userId),
      hospitalId: new Types.ObjectId(userHospitalId),
      measurementDate: new Date(),
      followUpDate: createGrowthRecordDto.followUpDate ? new Date(createGrowthRecordDto.followUpDate) : undefined,
    };

    const growthRecord = new this.growthRecordModel(growthData);
    return growthRecord.save();
  }

  async getGrowthRecordsByChildId(childId: string, userRole: string, userHospitalId?: string): Promise<GrowthRecord[]> {
    await this.findById(childId, userRole, userHospitalId);

    return this.growthRecordModel.find({ childId: new Types.ObjectId(childId) })
      .populate('childId', 'name birthDate gender')
      .populate('measuredBy', 'name email role')
      .populate('hospitalId', 'name type')
      .sort({ measurementDate: -1 })
      .exec();
  }

  async getLatestGrowthRecord(childId: string, userRole: string, userHospitalId?: string): Promise<GrowthRecord | null> {
    await this.findById(childId, userRole, userHospitalId);

    return this.growthRecordModel.findOne({ childId: new Types.ObjectId(childId) })
      .populate('childId', 'name birthDate gender')
      .populate('measuredBy', 'name email role')
      .sort({ measurementDate: -1 })
      .exec();
  }

  async updateGrowthRecord(id: string, updateGrowthRecordDto: any, userRole: string, userHospitalId?: string): Promise<GrowthRecord> {
    const record = await this.growthRecordModel.findById(id)
      .populate('childId')
      .exec();

    if (!record) {
      throw new NotFoundException('Growth record not found');
    }

    // Check access through child
    await this.findById((record.childId as any)._id.toString(), userRole, userHospitalId);

    const updateData: any = { ...updateGrowthRecordDto };
    if (updateGrowthRecordDto.childId) {
      updateData.childId = new Types.ObjectId(updateGrowthRecordDto.childId);
    }
    if (updateGrowthRecordDto.followUpDate) {
      updateData.followUpDate = new Date(updateGrowthRecordDto.followUpDate);
    }

    return this.growthRecordModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('childId', 'name birthDate gender')
      .populate('measuredBy', 'name email role')
      .populate('hospitalId', 'name type')
      .exec();
  }

  async deleteGrowthRecord(id: string, userRole: string, userHospitalId?: string): Promise<void> {
    const record = await this.growthRecordModel.findById(id)
      .populate('childId')
      .exec();

    if (!record) {
      throw new NotFoundException('Growth record not found');
    }

    // Check access through child
    await this.findById((record.childId as any)._id.toString(), userRole, userHospitalId);
    
    await this.growthRecordModel.findByIdAndDelete(id);
  }

  async getChildrenNeedingFollowUp(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<any[]> {
    const children = await this.findAll(userRole, userHospitalId, userWoredaId);
    const result = [];

    for (const child of children) {
      const latestRecord = await this.getLatestGrowthRecord((child as any)._id.toString(), userRole, userHospitalId);
      
      if (latestRecord && latestRecord.needsFollowUp && latestRecord.followUpDate) {
        const today = new Date();
        const followUpDate = new Date(latestRecord.followUpDate);
        
        if (followUpDate <= today) {
          result.push({
            child,
            latestRecord,
            overdueDays: Math.floor((today.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      }
    }

    return result.sort((a, b) => b.overdueDays - a.overdueDays);
  }

  private async filterChildrenByRole(
    children: Child[], 
    userRole: string, 
    userHospitalId?: string, 
    userWoredaId?: string
  ): Promise<Child[]> {
    if (userRole === 'SUPER_ADMIN' || userRole === 'SYSTEM_ADMIN') {
      return children;
    }

    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      return children.filter(c => c.birthHospital.toString() === userHospitalId);
    }

    if (userRole === 'WOREDA_ADMIN') {
      return children.filter(c => 
        c.motherId && (c.motherId as any).woredaId?.toString() === userWoredaId
      );
    }

    return [];
  }
}
