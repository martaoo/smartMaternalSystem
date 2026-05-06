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
      'LIAISON_OFFICER',
    ],
  })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  hospitalId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Woreda' })
  woredaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Region' })
  regionId: Types.ObjectId; // For SYSTEM_ADMIN - the region they manage

  @Prop()
  phoneNumber: string;

  @Prop()
  department: string;

  @Prop()
  licenseNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
