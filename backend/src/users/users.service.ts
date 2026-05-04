import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  private readonly hospitalManagedRoles = [
    'DOCTOR',
    'NURSE',
    'MIDWIFE',
    'DISPATCHER',
    'LIAISON_OFFICER',
    'HOSPITAL_APPROVER',
    'GATEKEEPER',
    'SPECIALIST',
  ];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role, hospitalId, healthCenterId, woredaId, ...userData } = createUserDto;
    const selectedHospitalId = hospitalId ?? healthCenterId;

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
      hospitalId: selectedHospitalId ? new Types.ObjectId(selectedHospitalId) : undefined,
      woredaId: woredaId ? new Types.ObjectId(woredaId) : undefined,
    });

    return user.save();
  }

  async createWithRoleValidation(
    createUserDto: CreateUserDto,
    creatorRole: string,
    creatorHospitalId?: string,
    creatorWoredaId?: string,
  ): Promise<User> {
    const { role: newRole } = createUserDto;

    if (creatorRole === 'HOSPITAL_ADMIN' || creatorRole === 'HEALTH_CENTER_ADMIN') {
      if (!creatorHospitalId) {
        throw new BadRequestException(`${creatorRole} must be assigned to a facility to create users`);
      }
      if (this.hospitalManagedRoles.includes(newRole)) {
        // Force hospital and woreda from the creator — ignore whatever the frontend sent
        const dto = {
          ...createUserDto,
          hospitalId: creatorHospitalId,
          woredaId: creatorWoredaId ?? createUserDto.woredaId,
        };
        return this.create(dto);
      } else if (['HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN', 'SUPER_ADMIN', 'WOREDA_ADMIN', 'SYSTEM_ADMIN'].includes(newRole)) {
        throw new BadRequestException(`${creatorRole} cannot create admin users`);
      }
    } else if (creatorRole === 'WOREDA_ADMIN') {
      throw new BadRequestException('Woreda Admin cannot create users');
    }

    return this.create(createUserDto);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .select('-password')
      .populate('hospitalId')
      .populate('woredaId')
      .exec();
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userModel
      .find({ role })
      .select('-password')
      .populate('hospitalId')
      .populate('woredaId')
      .exec();
  }

  async findAllWithRoleFilter(role: string, hospitalId?: string): Promise<User[]> {
    if (role === 'HOSPITAL_ADMIN' && hospitalId) {
      return this.userModel
        .find({ hospitalId: new Types.ObjectId(hospitalId) })
        .select('-password')
        .populate('hospitalId')
        .populate('woredaId')
        .exec();
    }
    return this.userModel
      .find()
      .select('-password')
      .populate('hospitalId')
      .populate('woredaId')
      .exec();
  }

  async findByRoleWithFilter(role: string, userRole: string, hospitalId?: string): Promise<User[]> {
    const query: any = { role };
    if (userRole === 'HOSPITAL_ADMIN' && hospitalId) {
      query.hospitalId = new Types.ObjectId(hospitalId);
    }
    return this.userModel
      .find(query)
      .select('-password')
      .populate('hospitalId')
      .populate('woredaId')
      .exec();
  }

  async findByIdWithRoleFilter(id: string, userRole: string, hospitalId?: string): Promise<User | null> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate('hospitalId')
      .populate('woredaId')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (userRole === 'HOSPITAL_ADMIN' && hospitalId) {
      if (user.hospitalId?.toString() !== hospitalId) {
        throw new ForbiddenException('Forbidden - Cannot access this user');
      }
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, password, role, hospitalId, woredaId, ...userData } = updateUserDto;

    // Check if user exists
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await this.userModel.findOne({ email });
      if (emailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password if provided
    const updateData: any = { ...userData };
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (hospitalId) updateData.hospitalId = new Types.ObjectId(hospitalId);
    if (woredaId) updateData.woredaId = new Types.ObjectId(woredaId);

    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').exec();
  }

  async updateWithRoleValidation(id: string, updateUserDto: UpdateUserDto, creatorRole: string, creatorHospitalId?: string): Promise<User> {
    const { role: newRole, hospitalId } = updateUserDto;

    // Find the user to update
    const userToUpdate = await this.userModel.findById(id);
    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    // Role-based update permissions
    if (creatorRole === 'HOSPITAL_ADMIN') {
      // Hospital Admin can only update workers for his own hospital
      if (!this.hospitalManagedRoles.includes(userToUpdate.role)) {
        throw new BadRequestException('Hospital Admin can only update hospital staff users');
      }
      if (userToUpdate.hospitalId?.toString() !== creatorHospitalId) {
        throw new BadRequestException('Hospital Admin can only update workers in their own hospital');
      }
      // Ensure hospitalId in update matches
      if (hospitalId && hospitalId !== creatorHospitalId) {
        throw new BadRequestException('Cannot change hospital for workers');
      }
    }

    return this.update(id, updateUserDto);
  }

  async getOwnProfile(id: string): Promise<any> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate({ path: 'hospitalId', populate: { path: 'woredaId' } })
      .populate('woredaId')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userObj: any = (user as any).toObject();

    // If woredaId is not directly set on the user but their hospital has one, derive it
    if (!userObj.woredaId && userObj.hospitalId?.woredaId) {
      userObj.woredaId = userObj.hospitalId.woredaId;
    }

    // If assignedRegion is not set but hospital's woreda has a region/city, derive it
    if (!userObj.assignedRegion && userObj.woredaId?.city) {
      userObj.assignedRegion = userObj.woredaId.city;
    }

    return userObj;
  }

  async updateSelf(
    id: string,
    data: { name?: string; email?: string; phoneNumber?: string; currentPassword?: string; newPassword?: string },
  ): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;

    if (data.email && data.email !== user.email) {
      const taken = await this.userModel.findOne({ email: data.email });
      if (taken) throw new ConflictException('Email already in use');
      updateData.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) throw new BadRequestException('Current password is incorrect');
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').populate('hospitalId').populate('woredaId').exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async deleteWithRoleValidation(id: string, creatorRole: string, creatorHospitalId?: string): Promise<void> {
    // Find the user to delete
    const userToDelete = await this.userModel.findById(id);
    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    // Role-based delete permissions
    if (creatorRole === 'HOSPITAL_ADMIN') {
      // Hospital Admin can only delete workers for his own hospital
      if (!this.hospitalManagedRoles.includes(userToDelete.role)) {
        throw new BadRequestException('Hospital Admin can only delete hospital staff users');
      }
      if (userToDelete.hospitalId?.toString() !== creatorHospitalId) {
        throw new BadRequestException('Hospital Admin can only delete workers in their own hospital');
      }
    }

    return this.delete(id);
  }
}
