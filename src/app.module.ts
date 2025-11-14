import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module'

@Module({
  imports: [CoreModule, DatabaseModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
