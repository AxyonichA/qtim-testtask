import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) {}

  async create(user: CreateUserDto) {
    return await this.usersRepo.createOne(user);
  }
}
