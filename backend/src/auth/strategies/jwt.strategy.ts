import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.usersService.getOwnProfile(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // getOwnProfile populates hospitalId/woredaId as full objects.
    // Controllers call .toString() on these, which would return "[object Object]".
    // Extract plain string IDs here so every controller gets a safe string.
    const hospitalId =
      user.hospitalId?._id?.toString() ??
      (typeof user.hospitalId === 'string' ? user.hospitalId : undefined);

    const woredaId =
      user.woredaId?._id?.toString() ??
      (typeof user.woredaId === 'string' ? user.woredaId : undefined);

    const regionId =
      user.regionId?._id?.toString() ??
      (typeof user.regionId === 'string' ? user.regionId : undefined);

    return {
      userId: payload.sub,
      _id: user._id,
      email: payload.email,
      role: payload.role,
      name: user.name,
      hospitalId,
      // facilityId is the canonical field for referral logic —
      // works for both hospital and health-center liaison officers
      // since both facility types are stored in the Hospital collection.
      facilityId: hospitalId,
      woredaId,
      regionId,
      assignedRegion: user.assignedRegion,
      phoneNumber: user.phoneNumber,
    };
  }
  
}
