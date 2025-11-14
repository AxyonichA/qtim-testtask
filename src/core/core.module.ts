import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'

import appConfig from 'src/config/app.config'
import databaseConfig from 'src/config/database.config'
import environmentValidation from 'src/config/environment.validation'

const ENV = process.env.NODE_ENV;

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidation,
    })
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {
}
