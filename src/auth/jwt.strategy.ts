import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieReq = req as RequestWithCookies;
  
        const cookieToken = cookieReq.cookies?.accessToken;
        if (typeof cookieToken === 'string') {
          return cookieToken;
        }
        const authHeader = req.headers['authorization'];
        if (
          typeof authHeader === 'string' &&
          authHeader.startsWith('Bearer ')
        ) {
          return authHeader.slice(7);
        }
  
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      issuer: configService.get<string>('jwt.issuer'),
      audience: configService.get<string>('jwt.audience'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.usersService.findById(payload.sub);
  }
}
