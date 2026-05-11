import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WoredaDocument = Woreda & Document;

@Schema({ timestamps: true })
export class Woreda {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop({ type: Types.ObjectId, ref: 'Region', required: true })
  regionId: Types.ObjectId;
}

export const WoredaSchema = SchemaFactory.createForClass(Woreda);

// Create compound index for unique name + city combination
WoredaSchema.index({ name: 1, city: 1 }, { unique: true });
