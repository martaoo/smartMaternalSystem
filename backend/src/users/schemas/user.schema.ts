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
    enum: ['MOH_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER', 'MOTHER'] 
  })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  hospitalId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Woreda' })
  woredaId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
