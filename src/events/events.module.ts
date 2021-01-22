import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG } from 'src/utils/config';
import { Message, MessageSchema } from './entities/message.entity';
import { EventsController } from './events.controller';

@Module({
  imports: [
    MongooseModule.forRoot(`${CONFIG().db.dialect}://${CONFIG().db.host}:${CONFIG().db.port}/${CONFIG().db.database}`,{
      useCreateIndex: true,
      connectionName: 'chat'
    }),
    MongooseModule.forFeature([{name: Message.name, schema: MessageSchema}], 'chat')
  ],
  providers: [EventsGateway, EventsService],
  controllers: [EventsController]
})
export class EventsModule {}
