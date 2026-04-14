import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VaccineDocument = Vaccine & Document;

@Schema({ timestamps: true })
export class Vaccine {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  code: string; // e.g., BCG, OPV, DTP

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ['BCG', 'OPV', 'PENTAVALENT', 'MEASLES', 'ROTA', 'PCV', 'HPV', 'COVID19', 'OTHER'], required: true })
  category: 'BCG' | 'OPV' | 'PENTAVALENT' | 'MEASLES' | 'ROTA' | 'PCV' | 'HPV' | 'COVID19' | 'OTHER';

  @Prop({ required: true })
  recommendedAge: string; // e.g., "At birth", "6 weeks", "9 months"

  @Prop({ required: true })
  recommendedAgeWeeks: number; // Age in weeks for scheduling

  @Prop({ default: 1 })
  dosesRequired: number;

  @Prop({ default: 4 })
  intervalWeeks: number; // Interval between doses in weeks

  @Prop()
  contraindications?: string[];

  @Prop()
  sideEffects?: string[];

  @Prop()
  storageRequirements?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'ROUTINE' })
  scheduleType: 'ROUTINE' | 'CAMPAIGN' | 'OUTBREAK';

  @Prop()
  targetPopulation?: string; // e.g., "All infants", "Pregnant women", "Health workers"

  @Prop({ default: 'IM' })
  administrationRoute: 'IM' | 'ORAL' | 'SC' | 'ID'; // Intramuscular, Oral, Subcutaneous, Intradermal

  @Prop()
  manufacturer?: string;

  @Prop()
  notes?: string;
}

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);
