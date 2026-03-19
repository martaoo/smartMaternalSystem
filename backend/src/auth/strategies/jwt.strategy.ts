import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    console.log('JWT validate payload sub:', payload.sub);
    const user = await this.usersService.findById(payload.sub);
    console.log('Fetched user:', user ? 'found' : 'not found');
    if (user) {
      console.log('User _id:', (user as any)._id);
      console.log('User hospitalId:', user.hospitalId);
      console.log('User toObject keys:', Object.keys((user as any).toObject()));
    }
    if (!user) {
      return null;
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      ...(user as any).toObject(),
    };
  }
}
