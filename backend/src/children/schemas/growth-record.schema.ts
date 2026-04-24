import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GrowthRecordDocument = GrowthRecord & Document;

@Schema({ timestamps: true })
export class GrowthRecord {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Child' })
  childId: Types.ObjectId;

  @Prop({ required: true })
  ageMonths: number;

  @Prop({ required: true })
  weight: number; // in kg

  @Prop({ required: true })
  height: number; // in cm

  @Prop()
  headCircumference?: number; // in cm

  @Prop()
  chestCircumference?: number; // in cm

  @Prop()
  muac?: number; // Mid-Upper Arm Circumference in cm

  @Prop({ enum: ['SEVERE_UNDERWEIGHT', 'MODERATE_UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE'], default: 'NORMAL' })
  growthStatus: 'SEVERE_UNDERWEIGHT' | 'MODERATE_UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';

  @Prop({ enum: ['SEVERE_STUNTING', 'MODERATE_STUNTING', 'NORMAL', 'TALL'], default: 'NORMAL' })
  heightStatus: 'SEVERE_STUNTING' | 'MODERATE_STUNTING' | 'NORMAL' | 'TALL';

  @Prop({ enum: ['SEVERE_WASTING', 'MODERATE_WASTING', 'NORMAL', 'OVERWEIGHT'], default: 'NORMAL' })
  weightStatus: 'SEVERE_WASTING' | 'MODERATE_WASTING' | 'NORMAL' | 'OVERWEIGHT';

  @Prop({ enum: ['RED', 'YELLOW', 'GREEN'], default: 'GREEN' })
  muacStatus: 'RED' | 'YELLOW' | 'GREEN';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  measuredBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  hospitalId: Types.ObjectId;

  @Prop({ default: Date.now })
  measurementDate: Date;

  @Prop()
  notes?: string;

  @Prop()
  recommendations?: string;

  @Prop({ default: false })
  needsFollowUp: boolean;

  @Prop()
  followUpDate?: Date;

  @Prop()
  feedingPattern?: string;

  @Prop()
  developmentalMilestones?: string[];

  @Prop()
  immunizationsReceived?: string[];

  @Prop()
  healthConcerns?: string[];
}

export const GrowthRecordSchema = SchemaFactory.createForClass(GrowthRecord);
