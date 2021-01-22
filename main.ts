import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { CONFIG } from './utils/config';
import * as cluster from 'cluster';
import * as os from 'os'
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function makeServer(type: string) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  console.log(CONFIG().port)
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(CONFIG().port);
  console.log(`${type} SERVER (${process.pid}) IS RUNNING `);

}

async function bootstrap() {
  console.log('Config==>: ', CONFIG());
  if (cluster.isMaster) {
    if(CONFIG().isDevEnvironment()) {
      await makeServer('MASTER')
    } else {
      const numCPUs = os.cpus().length;
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
  
      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
      });
    }
  } else {
    await makeServer('CHILD')
  }
}

bootstrap();
