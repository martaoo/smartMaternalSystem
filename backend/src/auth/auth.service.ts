import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private emailService: EmailService,
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

  /**
   * Initiate forgot password flow.
   * Security: Always return a generic message to avoid user enumeration.
   */
  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    // Generate a secure random token (raw) and a hashed version for storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Attempt to find user — but we will always respond with the same message
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      // Save hashed token and expiry
      await this.usersService.setPasswordResetTokenByEmail(normalizedEmail, hashedToken, expires);

      // Send email with raw token link (email sending failure should not leak info)
      try {
        await this.emailService.sendResetPasswordEmail(user.email, user.name || 'User', rawToken);
      } catch (err) {
        // swallow — do not reveal failures
      }
    }

    // Always return generic message
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  /**
   * Complete password reset: verify token, expiry, and update password.
   */
  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new BadRequestException('Token and newPassword are required');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByPasswordResetToken(hashedToken);
    if (!user) throw new BadRequestException('Invalid or expired token');

    if (!user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Update the password (usersService will hash and clear token fields)
    await this.usersService.resetPasswordById(user._id.toString(), newPassword);

    return { message: 'Password has been reset successfully' };
  }

  private normalizeEmail(email: string): string {
    return email?.toString().trim().toLowerCase();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const email = this.normalizeEmail(data.email);

    const user = new this.userModel({
      ...data,
      email,
      password: hashedPassword,
    });

    return user.save();
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    let user = await this.userModel.findOne({ email: normalizedEmail });

    if (!user) {
      user = await this.userModel.findOne({
        email: { $regex: new RegExp(`^${this.escapeRegex(email.trim())}$`, 'i') },
      });
    }

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

