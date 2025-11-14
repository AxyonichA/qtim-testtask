import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'

import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from './jwt.strategy'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async getTokens(user: User): Promise<{ accessToken: string; refreshToken: string; }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt.refreshTokenTTL'),
        issuer: this.configService.get<string>('jwt.issuer'),
        audience: this.configService.get<string>('jwt.audience'),
        secret: this.configService.get<string>('jwt.secret'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async register(dto: CreateUserDto): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await this.usersService.register(dto);

    const tokens = await this.getTokens(user);

    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await this.usersService.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.getTokens(user);

    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return {user, tokens};
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.setRefreshToken(userId, null);
  }
  async refreshTokens(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      const token = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      const user = await this.usersService.findByEmail(token.email);
      if (!user) {
        throw new UnauthorizedException();
      }
      return await this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        expiresIn: this.configService.get<string>('jwt.accessTokenTTL'),
      }),
      this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        expiresIn: this.configService.get<string>('jwt.refreshTokenTTL'),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
}