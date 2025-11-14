import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repository/users.repository'
import { TypeOrmUsersRepository } from './repository/users.typeorm-repository'
import { User } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: TypeOrmUsersRepository,
    },
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    UsersRepository
  ],
})
export class UsersModule {}
