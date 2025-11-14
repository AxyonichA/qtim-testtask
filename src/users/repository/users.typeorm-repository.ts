import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UsersRepository } from './users.repository'
import { User } from '../users.entity'
import { CreateUserDto } from '../dto/create-user.dto'

@Injectable()
export class TypeOrmUsersRepository extends UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {
    super()
  }

  createOne(user: CreateUserDto) {
    return this.repo.save(user);
  }
}