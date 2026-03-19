import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WoredaDocument = Woreda & Document;

@Schema({ timestamps: true })
export class Woreda {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  region: string;
}

export const WoredaSchema = SchemaFactory.createForClass(Woreda);
