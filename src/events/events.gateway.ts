import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { isMainThread } from 'worker_threads';
import { Server } from 'ws';
import { Message, MessageDocument } from './entities/message.entity';
import { EventsService } from './events.service';
import { IMessage } from './interfaces/message.interface';
import { MainWorker } from '../mian.worker';
import * as uniqid from 'uniqid';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @Inject()
  private readonly service: EventsService;
  @InjectModel(Message.name) 
  private messageModel: Model<MessageDocument>;

  private getToken(payload: string) {
    return payload.split(';')
    .map(p => p.trim())
    .find(p => p.split('=')[0] === 'user')
    .split('=')[1];
  }

  async handleConnection(client: any, req: Request) {
    try {
      const token = this.getToken(req.headers['cookie']);
    
      client.userId = token;
      client.id = uniqid();
      console.log('Token==>: ', token);
      this.service.addClient(client);
      const res = await this.messageModel.find().exec();
      let hasBadWords = false;
      if(isMainThread && res && res.length) {
        const worker = new MainWorker('/events/workers/checker.js',res);
        worker.postMessage(res);
        const result = await worker.getMessage() as any;
        hasBadWords = result?.data && result.data
      } 
      client.send(JSON.stringify({all: res, hasBadWords}));
    } catch(e) {
      console.log('Error==>: ', e);
    }
  
  }

  handleDisconnect(client: any) {
    console.log('Handle Disc', client.userId);
    this.service.destroyClient(client);
  }

  @SubscribeMessage('events')
  async onEvent(client: any, data: IMessage) {
    console.log('onEvent', client.userId, typeof data, data);
    await this.service.sendMessage(client.userId, data, false);
    await this.messageModel.create({
      userId: client.userId,
      text: data.content,
      date: data.date,
    });
  }
}
