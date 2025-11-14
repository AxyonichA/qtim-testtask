// auth.controller.ts
import { Body, Controller,Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

import { RequestWithCookies } from './jwt.strategy'
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/users.entity'
import { Public } from 'src/common/decorators/public.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);

    this.setCookieTokens(res, tokens);

    return { user, message: 'Logged in' };
  }

  @Public()
  @Post('register')
  async register(@Body() dto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.register(dto);

    this.setCookieTokens(res, tokens);

    return { user, message: 'Registered successfully' };
  }

  @Post('logout')
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    await this.authService.logout(user.id);

    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh(@Req() req: RequestWithCookies, @Res({ passthrough: true }) res: Response) {
    const refreshTokenFromCookie = req.cookies['refreshToken'];
    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const tokens = await this.authService.refreshTokens(refreshTokenFromCookie);

    this.setCookieTokens(res, tokens);

    return { message: 'Tokens refreshed' };
  }

  setCookieTokens(res: Response, tokens: { accessToken: string; refreshToken: string; }) {
    const isProd = this.configService.get('app.environment') !== 'development';
    const accessTTL = this.configService.get<number>('jwt.accessTokenTTL'); 
    const refreshTTL = this.configService.get<number>('jwt.refreshTokenTTL');
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: accessTTL,
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: refreshTTL,
    });
  }
}

