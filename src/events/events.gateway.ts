import { BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isMainThread } from 'worker_threads';
import { Server } from 'ws';
import { Message, MessageDocument } from './entities/message.entity';
import { EventsService } from './events.service';
import { IMessage } from './interfaces/message.interface';
import { MainWorker } from './workers';

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
    const token = this.getToken(req.headers['cookie']);
    
    client.userId = token;
    console.log('Token==>: ', token);
    this.service.addClient(client);
    const res = await this.messageModel.find().exec();
    let hasBadWords = false;
    if(isMainThread) {
      const worker = new MainWorker(res);
      worker.postMessage(res);
      hasBadWords = (await worker.getMessage() as any).data;
    } else {
      console.log('Inside Worker Thread!');
    }
    client.send(JSON.stringify({all: res, hasBadWords}));
  }

  handleDisconnect(client: any) {
    console.log('Handle Disc')
    this.service.destroyClient(client);
  }

  // @SubscribeMessage('init')
  // onInit(client: any, data: any): any {
  //   return this.messageModel.find({}, (d) => {
  //      console.log('Init', d)
  //      return from(d).pipe(map(item => ({ event: 'events', data: item })));
  //   })
  // }

  @SubscribeMessage('events')
  async onEvent(client: any, data: IMessage) {
    console.log('onEvent', client.userId, typeof data, data);
    this.messageModel.create({
      userId: client.userId,
      text: data.content,
      date: data.date,
    });
    await this.service.sendMessage(client.userId, data, false);
  }
}
