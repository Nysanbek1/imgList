import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ImegDocument = HydratedDocument<Imeg>;

@Schema({ timestamps: true })
export class Imeg {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, default: false })
  forAllPeople!: boolean;

  @Prop({ type: [String], required: true })
  imagePath!: string[];
}

export const ImegSchema = SchemaFactory.createForClass(Imeg);
