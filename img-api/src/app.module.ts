import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ImegsModule } from './imegs/imegs.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'SECRET_KEY_DONT_SHARE',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
    MongooseModule.forRoot('mongodb://localhost:27017/img-db'),
    ImegsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
