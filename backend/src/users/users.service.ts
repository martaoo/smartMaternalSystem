import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { WoredasService } from '../woredas/woredas.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private woredasService: WoredasService,
    private hospitalsService: HospitalsService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role, hospitalId, woredaId, assignedRegion, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      ...userData,
      email,
      password: hashedPassword,
      role,
      hospitalId: hospitalId ? new Types.ObjectId(hospitalId) : undefined,
      woredaId: woredaId ? new Types.ObjectId(woredaId) : undefined,
      assignedRegion,
    });

    return user.save();
  }

  async createWithRoleValidation(createUserDto: CreateUserDto, currentUser: any): Promise<User> {
    const currentUserRole = currentUser.role;
    const { role, assignedRegion, woredaId, hospitalId } = createUserDto;

    // Role-based creation permissions
    if (currentUserRole === 'SUPER_ADMIN') {
      // SUPER_ADMIN can create SYSTEM_ADMIN and any other role
      if (role === 'SYSTEM_ADMIN' && !assignedRegion) {
        throw new BadRequestException('System Admin must have an assigned region');
      }
      if (role === 'WOREDA_ADMIN') {
        if (!woredaId) {
          throw new BadRequestException('Woreda Admin must have a woredaId');
        }
        // Validate woreda exists
        const woreda = await this.woredasService.findById(woredaId);
        if (!woreda) {
          throw new BadRequestException('Woreda not found');
        }
      }
      if (role === 'HOSPITAL_ADMIN') {
        if (!woredaId || !hospitalId) {
          throw new BadRequestException('Hospital Admin must have both woredaId and hospitalId');
        }
        // Validate woreda exists
        const woreda = await this.woredasService.findById(woredaId);
        if (!woreda) {
          throw new BadRequestException('Woreda not found');
        }
        // Validate hospital exists
        const hospital = await this.hospitalsService.findById(hospitalId);
        if (!hospital) {
          throw new BadRequestException('Hospital not found');
        }
      }
    } else if (currentUserRole === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can create WOREDA_ADMIN, HOSPITAL_ADMIN, DOCTOR, NURSE, DISPATCHER, MOTHER
      if (['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(role)) {
        throw new ForbiddenException('System Admin cannot create Super Admin or other System Admins');
      }
      
      // Validate required fields for each role
      if (role === 'WOREDA_ADMIN') {
        if (!woredaId) {
          throw new BadRequestException('Woreda Admin must have a woredaId');
        }
        // Validate woreda belongs to their assigned region
        const woreda = await this.woredasService.findById(woredaId);
        if (!woreda) {
          throw new BadRequestException('Woreda not found');
        }
        if (woreda.region !== currentUser.assignedRegion) {
          throw new ForbiddenException('System Admin can only create Woreda Admins in their assigned region');
        }
      } else if (role === 'HOSPITAL_ADMIN') {
        if (!woredaId || !hospitalId) {
          throw new BadRequestException('Hospital Admin must have both woredaId and hospitalId');
        }
        // Validate woreda belongs to their assigned region
        const woreda = await this.woredasService.findById(woredaId);
        if (!woreda) {
          throw new BadRequestException('Woreda not found');
        }
        if (woreda.region !== currentUser.assignedRegion) {
          throw new ForbiddenException('System Admin can only create Hospital Admins in their assigned region');
        }
        // Validate hospital exists and belongs to their assigned region
        const hospital = await this.hospitalsService.findById(hospitalId);
        if (!hospital) {
          throw new BadRequestException('Hospital not found');
        }
        // Check if hospital is in the same woreda
        if (hospital.woredaId?.toString() !== woredaId) {
          throw new ForbiddenException('Hospital Admin must be in the same woreda as specified');
        }
      } else if (['DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN', 'MOTHER'].includes(role)) {
        // These roles must be within the System Admin's assigned region
        if (woredaId) {
          const woreda = await this.woredasService.findById(woredaId);
          if (woreda && woreda.region !== currentUser.assignedRegion) {
            throw new ForbiddenException('System Admin can only create users in their assigned region');
          }
        }
        if (hospitalId) {
          const hospital = await this.hospitalsService.findById(hospitalId);
          if (hospital) {
            const hospitalWoreda = await this.woredasService.findById(hospital.woredaId?.toString());
            if (hospitalWoreda && hospitalWoreda.region !== currentUser.assignedRegion) {
              throw new ForbiddenException('System Admin can only create users in their assigned region');
            }
          }
        }
      }
    } else if (currentUserRole === 'WOREDA_ADMIN') {
      // WOREDA_ADMIN can create HOSPITAL_ADMIN, DOCTOR, NURSE, DISPATCHER, MOTHER
      if (['SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN'].includes(role)) {
        throw new ForbiddenException('Woreda Admin cannot create higher level admins');
      }
      
      // Validate required fields and ensure created users are within their woreda
      if (role === 'HOSPITAL_ADMIN') {
        if (!woredaId || !hospitalId) {
          throw new BadRequestException('Hospital Admin must have both woredaId and hospitalId');
        }
        // Validate woreda exists
        const woreda = await this.woredasService.findById(woredaId);
        if (!woreda) {
          throw new BadRequestException('Woreda not found');
        }
        if (woredaId !== currentUser.woredaId?.toString()) {
          throw new ForbiddenException('Woreda Admin can only create Hospital Admins for their woreda');
        }
      } else if (['DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN', 'MOTHER'].includes(role)) {
        if (!woredaId) {
          throw new BadRequestException(`${role} must have a woredaId`);
        }
        // Validate woreda exists
        const woreda = await this.woredasService.findById(woredaId);
        if (!woreda) {
          throw new BadRequestException('Woreda not found');
        }
        if (woredaId !== currentUser.woredaId?.toString()) {
          throw new ForbiddenException('Woreda Admin can only create users for their woreda');
        }
      }
    } else if (currentUserRole === 'HOSPITAL_ADMIN') {
      // HOSPITAL_ADMIN can create DOCTOR, NURSE, MIDWIFE, DISPATCHER, EMERGENCY_ADMIN, MOTHER
      if (['SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN'].includes(role)) {
        throw new ForbiddenException('Hospital Admin cannot create admin users');
      }
      
      // Validate required fields and auto-assign woredaId and hospitalId from current user
      if (['DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN', 'MOTHER'].includes(role)) {
        // Auto-assign woredaId and hospitalId from current Hospital Admin
        const autoWoredaId = currentUser.woredaId?.toString();
        const autoHospitalId = currentUser.hospitalId?.toString();
        
        if (!autoWoredaId || !autoHospitalId) {
          throw new BadRequestException('Hospital Admin must be assigned to a woreda and hospital');
        }
        
        // Override provided IDs with current user's assigned IDs
        createUserDto.woredaId = autoWoredaId;
        createUserDto.hospitalId = autoHospitalId;
      }
    }

    return this.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findAllWithRoleFilter(currentUser: any): Promise<User[]> {
    const { role, assignedRegion, woredaId, hospitalId } = currentUser;

    if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN can see all users
      return this.userModel.find().exec();
    } else if (role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can see all users in their assigned region
      return this.userModel.find({ 
        $or: [
          { assignedRegion: assignedRegion },
          { role: { $in: ['DOCTOR', 'NURSE', 'DISPATCHER', 'MOTHER'] } }
        ]
      }).exec();
    } else if (role === 'WOREDA_ADMIN') {
      // WOREDA_ADMIN can see all users in their woreda
      return this.userModel.find({ 
        $or: [
          { woredaId: woredaId },
          { hospitalId: { $in: await this.getHospitalsInWoreda(woredaId) } }
        ]
      }).exec();
    } else if (role === 'HOSPITAL_ADMIN') {
      // HOSPITAL_ADMIN can see all users in their hospital
      return this.userModel.find({ hospitalId: hospitalId }).exec();
    }

    return [];
  }

  async findByRoleWithFilter(role: string, currentUser: any): Promise<User[]> {
    const users = await this.userModel.find({ role }).exec();
    
    // Filter based on current user's permissions
    if (currentUser.role === 'SUPER_ADMIN') {
      return users;
    } else if (currentUser.role === 'SYSTEM_ADMIN') {
      return users.filter(user => 
        user.assignedRegion === currentUser.assignedRegion || 
        ['DOCTOR', 'NURSE', 'DISPATCHER', 'MOTHER'].includes(role)
      );
    } else if (currentUser.role === 'WOREDA_ADMIN') {
      return users.filter(user => 
        user.woredaId?.toString() === currentUser.woredaId?.toString()
      );
    } else if (currentUser.role === 'HOSPITAL_ADMIN') {
      return users.filter(user => 
        user.hospitalId?.toString() === currentUser.hospitalId?.toString()
      );
    }

    return [];
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User> {
    const { password, ...dataWithoutPassword } = updateData;
    
    console.log('Updating user with ID:', id);
    console.log('Update data:', updateData);
    
    // Hash password if provided
    const finalUpdateData: any = { ...dataWithoutPassword };
    if (password) {
      finalUpdateData.password = await bcrypt.hash(password, 10);
      console.log('Password hashed');
    }
    
    console.log('Final update data:', finalUpdateData);
    
    const result = await this.userModel.findByIdAndUpdate(id, finalUpdateData, { new: true }).exec();
    console.log('Update result:', result);
    
    return result;
  }

  private async getHospitalsInWoreda(woredaId: string): Promise<Types.ObjectId[]> {
    // This would need to be implemented to get hospitals in a woreda
    // For now, return empty array
    return [];
  }
}
