import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HospitalDocument = Hospital & Document;

@Schema({ timestamps: true })
export class Hospital {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['HOSPITAL', 'HEALTH_CENTER', 'CLINIC'] })
  type: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  contact: string;

  @Prop({ type: Types.ObjectId, ref: 'Woreda' })
  woredaId: Types.ObjectId;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
