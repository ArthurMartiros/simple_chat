import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClient } from 'redis';
import { CONFIG } from 'src/utils/config';
import { IMessage } from './interfaces/message.interface';
import { MainWorker } from './workers';
import {isMainThread} from 'worker_threads';

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private redisBroker: RedisClient;
  private publisher: RedisClient;
  private subscriber: RedisClient;
  private refreshInterval;
  private channelId: string;
  private connectionPool: { [key: string]: any[] } = {};
  private allClients = [];

  private getAllExceptSelf(userId) {
    return this.allClients.filter(i => i.userId !== userId);
  }

  public addClient(client: any) {
    if (!this.connectionPool[client.userId])
        this.connectionPool[client.userId] = [];
    this.connectionPool[client.userId].push(client);
    this.allClients.push(client);
  }

  public getClient(userId: string) {
    return this.connectionPool[userId];
  }

  public destroyClient(client: any) {
    this.connectionPool[client.userId] = this.connectionPool[
        client.userId
      ].filter(p => p.id !== client.id);
    this.allClients = this.allClients.filter(p => p.id !== client.id);
  }
  
  constructor() {
    const postfix = process.pid;
    this.channelId = CONFIG().channel_prefix + postfix

    // setInterval(() => {
    // this.sendMessage(
    //     'name',
    //     new Date().toLocaleTimeString() +
    //     ` | from server on port ${process.env['PORT']}`,
    //     false,
    // );
    // }, 3000);
  }

  async onModuleInit() {
    console.log('onModuleInit');
    this.redisBroker = await this.makeRedisClient();
    this.subscriber = await this.makeRedisClient();
    this.publisher = await this.makeRedisClient();

    this.subscriber.subscribe(this.channelId);

    this.subscriber.on('message', (channel, message) => {
      const { userId, payload } = JSON.parse(message);
      console.log('Steaaa===>: ', userId, payload);
      this.sendMessage(userId, payload, true);
    });

    await this.keepChannelFresh();
  }

  private async makeRedisClient() {
    return createClient({
      host: CONFIG().redis.host,
      port: CONFIG().redis.port,
    });
  }

  private get keys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        if(!this.redisBroker) return resolve([]);
        this.redisBroker.keys(`${CONFIG().channel_prefix}*`, (err, content) => {
            if(err) {
                return reject(err);
            }
            resolve(content);
        });
    });
  }

  private async keepChannelFresh() {
    this.redisBroker.setex(this.channelId, 10, Date.now().toString());
    this.refreshInterval = setTimeout(() => {
      this.keepChannelFresh();
    }, 9000);
  }

  public async onModuleDestroy() {
      console.log('Destroyed')
    this.refreshInterval && clearTimeout(this.refreshInterval);
  }

  public async sendMessage(userId: string, payload: IMessage, fromRedis: boolean) {    
    console.log('All==>: ',process.pid, this.allClients.map(i=> i.userId));
    this.allClients.forEach(socket =>
        socket.send(JSON.stringify({userId, payload})),
    );
    if (!fromRedis && this.publisher) {
        const channels = await this.keys;
        const filtered = channels.filter(p => p != this.channelId);
        filtered.forEach(ch => {
            this.publisher.publish(
                ch,
                JSON.stringify({payload,userId})
            );
        });
    }
  }
}