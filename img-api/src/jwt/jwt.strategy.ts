import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Извлекаем JWT из заголовка Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Запрос отклонится, если срок действия токена истек
      secretOrKey: 'SECRET_KEY_DONT_SHARE', // Ключ шифрования (лучше брать из .env)
    });
  }

  // Сюда попадает уже расшифрованный payload из токена (например, { sub: userId, username: string })
  validate(payload: { sub: string; username: string }) {
    // То, что возвращает этот метод, NestJS автоматически запишет в объект запроса: request.user
    return { userId: payload.sub, username: payload.username };
  }
}
