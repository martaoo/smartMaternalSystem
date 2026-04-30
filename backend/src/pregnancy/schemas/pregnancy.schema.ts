import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PregnancyDocument = Pregnancy & Document;

@Schema({ timestamps: true })
export class Pregnancy {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Mother' })
  motherId: Types.ObjectId;

  @Prop({ required: true })
  week: number;

  @Prop({ required: true })
  gestationalAge: number; // in weeks

  @Prop()
  systolicBP?: number;

  @Prop()
  diastolicBP?: number;

  @Prop()
  weight?: number; // in kg

  @Prop()
  fundalHeight?: number; // in cm

  @Prop()
  fetalHeartRate?: number;

  @Prop()
  presentation?: string; // 'Cephalic', 'Breech', 'Transverse'

  @Prop()
  notes?: string;

  @Prop({ enum: ['LOW', 'MODERATE', 'HIGH'], default: 'LOW' })
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';

  @Prop()
  symptoms?: string[];

  @Prop()
  medications?: string[];

  @Prop()
  nextVisitDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  healthWorkerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  hospitalId: Types.ObjectId;

  @Prop({ default: Date.now })
  visitDate: Date;

  @Prop()
  ultrasoundFindings?: string;

  @Prop({ type: Object, default: {} })
  labResults?: {
    hemoglobin?: number;
    urineProtein?: string;
    bloodSugar?: number;
    hiv?: string;
    syphilis?: string;
  };

  @Prop()
  complications?: string[];

  @Prop()
  recommendations?: string;

  @Prop({ default: false })
  emergency: boolean;

  @Prop()
  emergencyReason?: string;

  @Prop({ enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-'] })
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-';
}

export const PregnancySchema = SchemaFactory.createForClass(Pregnancy);
