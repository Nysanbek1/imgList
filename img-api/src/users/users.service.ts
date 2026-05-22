import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly users: Model<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.users.findOne({ name: createUserDto.name });
    if (user) {
      throw new UnauthorizedException('Такое имя пользователя уже занято');
    }
    const newUser = await this.users.create(createUserDto);
    const payload = { username: newUser.name, sub: newUser._id };
    return {
      access_token: this.jwtService.sign(payload),
      userId: newUser._id,
      userName: newUser.name,
    };
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.users.findOne({ name: loginDto.name }).exec();

    if (!user) {
      throw new UnauthorizedException('Пользователь с таким именем не найден');
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }
    const payload = { username: user.name, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      _id: user._id,
      name: user.name,
    };
  }
}
