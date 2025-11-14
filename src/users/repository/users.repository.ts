import { CreateUserDto } from '../dto/create-user.dto'
import { User } from '../users.entity'

export abstract class UsersRepository {
  abstract createOne(user: CreateUserDto): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByEmailWithPassword(email: string): Promise<User | null>;
  abstract findById(id: number): Promise<User | null>;
  abstract update(id: number, data: Partial<User>): Promise<void>;
  abstract updateRefreshToken(id: number, refreshToken: string | null): Promise<void>;
}
