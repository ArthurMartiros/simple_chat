import { BadRequestException, Body, Controller, Get, Inject, Post, ValidationPipe } from '@nestjs/common';
import { PostMessage } from './dto/message.dto';
import { EventsService } from './events.service';
import { Message, MessageDocument } from './entities/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('/')
export class EventsController {
  @Inject()
  private readonly service: EventsService;
  @InjectModel(Message.name) 
  private messageModel: Model<MessageDocument>;

  constructor() {}

  @Post('/send')
  async send(@Body() data: PostMessage) {
    try {
      this.messageModel.create({
        userId: data.userId,
        text: data.payload.content,
        date: data.payload.date,
      });
      await this.service.sendMessage(data.userId, data.payload, false);
      return {success: true};
    } catch(e) {
      console.log(e);
      throw new BadRequestException('Something Went Wrong :(');
    }
 
  }
}
