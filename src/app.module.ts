import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [CoreModule, DatabaseModule, UsersModule, AuthModule, ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
