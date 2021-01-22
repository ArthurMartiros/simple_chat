import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
@Module({
  imports: [ConfigModule.forRoot(), EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
