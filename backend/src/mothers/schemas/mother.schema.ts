import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MotherDocument = Mother & Document;

@Schema({ timestamps: true })
export class Mother {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Hospital' })
  healthCenter: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Woreda' })
  woredaId: Types.ObjectId;

  @Prop({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'DELIVERED' | 'INACTIVE';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedHealthWorker?: Types.ObjectId;

  @Prop()
  emergencyContact?: string;

  @Prop()
  medicalHistory?: string;

  @Prop()
  lastVisitDate?: Date;

  @Prop({ default: Date.now })
  registrationDate: Date;

  @Prop()
  expectedDeliveryDate?: Date;

  @Prop({ default: false })
  highRisk: boolean;

  @Prop()
  gravida?: number; // Number of pregnancies

  @Prop()
  para?: number; // Number of births

  @Prop()
  lmp?: Date; // Last Menstrual Period
}

export const MotherSchema = SchemaFactory.createForClass(Mother);
