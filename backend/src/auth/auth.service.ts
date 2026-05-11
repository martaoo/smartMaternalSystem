import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  private getIdString(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value._id) return String(value._id);
    if (typeof value.toString === 'function') {
      const str = value.toString();
      if (str !== '[object Object]') return str;
    }
    return undefined;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    hospitalId?: Types.ObjectId;
    woredaId?: Types.ObjectId;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new this.userModel({
      ...data,
      password: hashedPassword,
    });

    return user.save();
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const fullUser = await this.usersService.getOwnProfile(user._id.toString());
    const payload = { sub: user._id, role: user.role, email: user.email, name: user.name };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: this.getIdString(fullUser._id) ?? user._id.toString(),
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        hospitalId: this.getIdString(fullUser.hospitalId),
        woredaId: this.getIdString(fullUser.woredaId),
        assignedRegion: fullUser.assignedRegion,
        phoneNumber: fullUser.phoneNumber,
        regionId: this.getIdString(fullUser.regionId),
      }
    };
  }
}

