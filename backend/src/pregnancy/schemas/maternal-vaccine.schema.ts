import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaternalVaccineDocument = MaternalVaccine & Document;

// WHO-recommended maternal vaccines with intervals
export const MATERNAL_VACCINE_SCHEDULE = {
  TT1: { name: 'Tetanus Toxoid 1', nextDoseWeeks: 4, doseNumber: 1 },
  TT2: { name: 'Tetanus Toxoid 2', nextDoseWeeks: 26, doseNumber: 2 }, // 6 months after TT1
  TT3: { name: 'Tetanus Toxoid 3', nextDoseWeeks: 52, doseNumber: 3 }, // 1 year after TT2
  TT4: { name: 'Tetanus Toxoid 4', nextDoseWeeks: 52, doseNumber: 4 },
  TT5: { name: 'Tetanus Toxoid 5', nextDoseWeeks: 52, doseNumber: 5 },
  INFLUENZA: { name: 'Influenza Vaccine', nextDoseWeeks: null, doseNumber: 1 },
};

@Schema({ timestamps: true })
export class MaternalVaccine {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Mother' })
  motherId: Types.ObjectId;

  @Prop({ required: true })
  vaccineName: string; // e.g. 'TT1', 'TT2', 'Influenza'

  @Prop({ required: true })
  doseNumber: number;

  @Prop({ required: true, type: Date })
  givenDate: Date;

  @Prop({ type: Date })
  nextDoseDate?: Date;

  @Prop({ enum: ['GIVEN', 'SCHEDULED', 'MISSED', 'NOT_APPLICABLE'], default: 'GIVEN' })
  status: 'GIVEN' | 'SCHEDULED' | 'MISSED' | 'NOT_APPLICABLE';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  givenBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  givenAt: Types.ObjectId;

  @Prop()
  batchNumber?: string;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop({ type: Date })
  reminderSentDate?: Date;

  // ── Manual override ───────────────────────────────────────────────────────
  @Prop({ default: false })
  manualOverride: boolean;

  @Prop()
  overrideReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const MaternalVaccineSchema = SchemaFactory.createForClass(MaternalVaccine);
