import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mother, MotherDocument } from './schemas/mother.schema';
import { CreateMotherDto } from './dto/create-mother.dto';

@Injectable()
export class MothersService {
  constructor(
    @InjectModel(Mother.name) private motherModel: Model<MotherDocument>,
  ) {}

  async create(
    createMotherDto: CreateMotherDto,
    userRole: string,
    userHospitalId?: string,
    userWoredaId?: string
  ): Promise<Mother> {
  
    let healthCenterId: string;
  
    if (
      userRole === 'HOSPITAL_ADMIN' ||
      userRole === 'DOCTOR' ||
      userRole === 'NURSE' ||
      userRole === 'MIDWIFE'
    ) {
      if (!userHospitalId) {
        throw new BadRequestException(
          'You must be assigned to a hospital to register mothers'
        );
      }
      healthCenterId = userHospitalId;
    } else {
      throw new BadRequestException(
        'Only hospital staff can register mothers'
      );
    }
  
    const motherData = {
      name: createMotherDto.name,
      phone: createMotherDto.phone,
      age: createMotherDto.age,
      address: createMotherDto.address,
      emergencyContact: createMotherDto.emergencyContact,
      medicalHistory: createMotherDto.medicalHistory,
      expectedDeliveryDate: createMotherDto.expectedDeliveryDate,
      gravida: createMotherDto.gravida,
      para: createMotherDto.para,
      lmp: createMotherDto.lmp,
      registeredBy: createMotherDto.registeredBy || 'System',
      
      // ✅ FIX: Use woredaId from DTO if userWoredaId is not available
      woredaId: userWoredaId 
        ? new Types.ObjectId(userWoredaId) 
        : (createMotherDto.woredaId ? new Types.ObjectId(createMotherDto.woredaId) : undefined),
      
      healthCenter: new Types.ObjectId(healthCenterId),
    };
  
    console.log('=== SERVICE CREATE DEBUG ===');
    console.log('User role:', userRole);
    console.log('User hospitalId:', userHospitalId);
    console.log('User woredaId:', userWoredaId);
    console.log('DTO woredaId:', createMotherDto.woredaId);
    console.log('Final motherData:', JSON.stringify(motherData, null, 2));
  
    const mother = new this.motherModel(motherData);
    return mother.save();
  }
  async findAll(userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Mother[]> {
    let query: any = {};

    // Filter based on user role
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      // Hospital staff can only see mothers from their hospital
      query.healthCenter = new Types.ObjectId(userHospitalId);
    } else if (userRole === 'WOREDA_ADMIN') {
      // Woreda admin can see mothers from their woreda
      query.woredaId = new Types.ObjectId(userWoredaId);
    }
    // SUPER_ADMIN and SYSTEM_ADMIN can see all mothers

    return this.motherModel.find(query)
      .populate('healthCenter', 'name type')
      .populate('woredaId', 'name region')
      .populate('assignedHealthWorker', 'name email role')
      .sort({ registrationDate: -1 })
      .exec();
  }

  async findById(id: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Mother> {
    const mother = await this.motherModel.findById(id)
      .populate('healthCenter', 'name type address')
      .populate('woredaId', 'name region')
      .populate('assignedHealthWorker', 'name email role phone')
      .exec();

    if (!mother) {
      throw new NotFoundException('Mother not found');
    }

    // Check access permissions
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      const motherHealthCenterId =
        typeof mother.healthCenter === 'object' && mother.healthCenter !== null && '_id' in mother.healthCenter
          ? (mother.healthCenter as any)._id?.toString()
          : (mother.healthCenter as any)?.toString();

      if (userHospitalId && motherHealthCenterId !== String(userHospitalId)) {
        throw new NotFoundException('Mother not found or access denied');
      }
    } else if (userRole === 'WOREDA_ADMIN') {
      const motherWoredaId =
        typeof mother.woredaId === 'object' && mother.woredaId !== null && '_id' in mother.woredaId
          ? (mother.woredaId as any)._id?.toString()
          : (mother.woredaId as any)?.toString();

      if (userWoredaId && motherWoredaId !== String(userWoredaId)) {
        throw new NotFoundException('Mother not found or access denied');
      }
    }

    return mother;
  }

  async update(id: string, updateMotherDto: any, userRole: string, userHospitalId?: string): Promise<Mother> {
    const mother = await this.findById(id, userRole, userHospitalId);

    // Update fields
    const updateData: any = { ...updateMotherDto };
    if (updateMotherDto.healthCenter) {
      updateData.healthCenter = new Types.ObjectId(updateMotherDto.healthCenter);
    }
    if (updateMotherDto.assignedHealthWorker) {
      updateData.assignedHealthWorker = new Types.ObjectId(updateMotherDto.assignedHealthWorker);
    }

    return this.motherModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('healthCenter', 'name type')
      .populate('woredaId', 'name region')
      .populate('assignedHealthWorker', 'name email role')
      .exec();
  }

  async delete(id: string, userRole: string, userHospitalId?: string): Promise<void> {
    await this.findById(id, userRole, userHospitalId);
    await this.motherModel.findByIdAndDelete(id);
  }

  async findByPhone(phone: string): Promise<Mother | null> {
    return this.motherModel.findOne({ phone }).exec();
  }

  /**
   * Resolve Mother profile for a logged-in MOTHER app user.
   * Prefer explicit linkedMotherId on User, then phone match.
   */
  async findMotherForAuthenticatedAppUser(user: {
    linkedMotherId?: Types.ObjectId | string | { _id?: Types.ObjectId };
    phoneNumber?: string;
  }): Promise<MotherDocument | null> {
    const linked = user.linkedMotherId as any;
    if (linked) {
      const id =
        typeof linked === 'string'
          ? linked
          : linked._id?.toString?.() ?? linked.toString?.();
      if (id) {
        const byLink = await this.motherModel.findById(id).exec();
        if (byLink) return byLink;
      }
    }

    const raw = (user.phoneNumber || '').trim();
    if (!raw) {
      return null;
    }

    let m = await this.motherModel.findOne({ phone: raw }).exec();
    if (m) return m;

    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 8) {
      m = await this.motherModel
        .findOne({ phone: { $regex: new RegExp(`${digits}$`) } })
        .exec();
    }
    return m;
  }

  async search(query: string, userRole: string, userHospitalId?: string, userWoredaId?: string): Promise<Mother[]> {
    let searchQuery: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ]
    };

    // Apply role-based filtering
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      searchQuery.healthCenter = new Types.ObjectId(userHospitalId);
    } else if (userRole === 'WOREDA_ADMIN') {
      searchQuery.woredaId = new Types.ObjectId(userWoredaId);
    }

    return this.motherModel.find(searchQuery)
      .populate('healthCenter', 'name type')
      .populate('woredaId', 'name region')
      .populate('assignedHealthWorker', 'name email role')
      .sort({ registrationDate: -1 })
      .exec();
  }
async findByPhoneOrEmail(phone: string, email?: string): Promise<Mother | null> {
  const query: any = {
    $or: [{ phone }]
  };

  if (email) {
    query.$or.push({ email });
  }

  return this.motherModel.findOne(query).exec();
}
  async getMothersByHealthWorker(healthWorkerId: string, userRole: string, userHospitalId?: string): Promise<Mother[]> {
    let query: any = { assignedHealthWorker: new Types.ObjectId(healthWorkerId) };

    // Additional filtering based on user role
    if (userRole === 'HOSPITAL_ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'MIDWIFE') {
      query.healthCenter = new Types.ObjectId(userHospitalId);
    }

    return this.motherModel.find(query)
      .populate('healthCenter', 'name type')
      .populate('woredaId', 'name region')
      .populate('assignedHealthWorker', 'name email role')
      .sort({ registrationDate: -1 })
      .exec();
  }

  async getLatestPregnancy(motherId: string): Promise<any> {
    // Use the native MongoDB connection to access the Pregnancy collection
    const db = this.motherModel.db;
    const pregnancyCollection = db.collection('pregnancies');
    
    return pregnancyCollection.findOne({ motherId: new Types.ObjectId(motherId) })
      .then((result: any) => {
        if (result) {
          // Convert ObjectId fields to strings for consistency
          if (result._id) result._id = result._id.toString();
          if (result.healthWorkerId) result.healthWorkerId = result.healthWorkerId.toString();
          if (result.hospitalId) result.hospitalId = result.hospitalId.toString();
          if (result.motherId) result.motherId = result.motherId.toString();
        }
        return result;
      });
  }
}
