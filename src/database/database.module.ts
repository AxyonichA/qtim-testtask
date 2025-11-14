import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { DatabaseService } from 'src/database/database.service';
import { TransactionManager } from './trx-manager/trx-manager.abstract'
import { TrxManagerProvider } from './trx-manager/trx-manager.provider'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        synchronize: configService.get('database.synchronize'),
        namingStrategy: new SnakeNamingStrategy(),
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
      }),
    }),
  ],
  providers: [DatabaseService, TrxManagerProvider],
  exports: [DatabaseService, TransactionManager],
})
export class DatabaseModule {}
