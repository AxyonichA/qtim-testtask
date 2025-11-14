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


  async createOne(data: CreateUserDto): Promise<User> {
    const user = this.repo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });

    return this.repo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }
  
  findByEmailWithPassword(email: string): Promise<User | null> {
  return this.repo
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :email', { email })
    .getOne();
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    await this.repo.update({ id }, data);
  }

  async updateRefreshToken(userId: number, refreshToken: string | null,): Promise<void> {
    await this.repo.update({ id: userId }, { refreshToken });
  }
}