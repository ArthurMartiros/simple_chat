import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({    
      type: String,
      index: true,
      required: true
  })
  userId: string;
  @Prop({
      type: String,
      required: true
  })
  text: string;
  @Prop({
      type: Date
  })
  date: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);