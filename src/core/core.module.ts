import { createKeyv } from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import appConfig from 'src/config/app.config';
import cacheConfig from 'src/config/cache.config'
import databaseConfig from 'src/config/database.config';
import environmentValidation from 'src/config/environment.validation';
import jwtConfig from 'src/config/jwt.config';
import { DatabaseModule } from 'src/database/database.module';

const ENV = process.env.NODE_ENV;

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, jwtConfig, cacheConfig],
      validationSchema: environmentValidation,
    }),
    DatabaseModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('redis.host', 'localhost');
        const port = configService.get<number>('redis.port', 6379);
        const password = configService.get<string>('redis.password');

        const redisUrl = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;

        const ttl = 60 * 1000;

        return {
          stores: [
            createKeyv({
              url: redisUrl,
            }),
          ],
          ttl,
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [DatabaseModule, CacheModule],
})
export class CoreModule {}
