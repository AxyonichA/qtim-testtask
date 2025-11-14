import { CreateUserDto } from '../dto/create-user.dto'
import { User } from '../users.entity'

export abstract class UsersRepository {
  abstract createOne(user: CreateUserDto): Promise<User>;
}
