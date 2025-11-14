import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'

import { UsersRepository } from './repository/users.repository'
import { User } from './users.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) {}

  async register(dto: CreateUserDto): Promise<User> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.usersRepo.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const password = await bcrypt.hash(dto.password, 10);

    return this.usersRepo.createOne({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email,
      password,
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersRepo.findByEmailWithPassword(normalizedEmail);
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return { ...user, password: null};
  }

  async setRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    const hash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.usersRepo.updateRefreshToken(userId, hash);
  }
}
