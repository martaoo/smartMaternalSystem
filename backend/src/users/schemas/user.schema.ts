import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    required: true, 
    enum: [
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
      'WOREDA_ADMIN',
      'HOSPITAL_ADMIN',
      'HEALTH_CENTER_ADMIN',
      'DOCTOR',
      'NURSE',
      'MIDWIFE',
      'DISPATCHER',
      'EMERGENCY_ADMIN',
      'MOTHER',
      'LIAISON_OFFICER',
      'HOSPITAL_APPROVER',
      'GATEKEEPER',
      'SPECIALIST',
    ] 
  })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  hospitalId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Woreda' })
  woredaId: Types.ObjectId;

  @Prop()
  assignedRegion: string; // For SYSTEM_ADMIN - the region/subcity they manage

  @Prop()
  phoneNumber: string;

  @Prop()
  department: string;

  @Prop()
  licenseNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
