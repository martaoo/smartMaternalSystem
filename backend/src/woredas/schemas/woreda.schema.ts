import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WoredaDocument = Woreda & Document;

@Schema({ timestamps: true })
export class Woreda {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  region: string;
}

export const WoredaSchema = SchemaFactory.createForClass(Woreda);

// Create compound index for unique name + city combination
WoredaSchema.index({ name: 1, city: 1 }, { unique: true });
