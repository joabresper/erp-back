import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestWithUser } from '../entities/req.entity';
import { Payload } from '../entities/payload.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: Payload): RequestWithUser['user'] {
    // Esto es lo que NestJS inyecta en 'req.user' en todos los controladores.
    return {
      id: payload.sub,
      role: payload.role,
      level: payload.level,
    };
  }
}
