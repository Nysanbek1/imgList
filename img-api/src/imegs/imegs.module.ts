import { Module } from '@nestjs/common';
import { ImegsService } from './imegs.service';
import { ImegsController } from './imegs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Imeg, ImegSchema } from './entities/imeg.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { PhotoServis } from 'src/servis/photo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Imeg.name, schema: ImegSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ImegsController],
  providers: [ImegsService, PhotoServis],
})
export class ImegsModule {}
