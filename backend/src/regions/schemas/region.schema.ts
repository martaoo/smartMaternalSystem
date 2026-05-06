import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegionDocument = Region & Document;

@Schema({ timestamps: true })
export class Region {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  code: string; // e.g., "AA" for Addis Ababa, "DR" for Dire Dawa

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
