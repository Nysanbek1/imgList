import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ImegsService } from './imegs.service';
import { CreateImegDto } from './dto/create-imeg.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UpdateImegDto } from './dto/update-imeg.dto';
import { DellImegDto } from './dto/dell-imegs.dto';

@Controller('imegs')
@UseGuards(JwtAuthGuard)
export class ImegsController {
  constructor(private readonly imegsService: ImegsService) {}

  @Post('createPostImg')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createImegDto: CreateImegDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imegsService.create(createImegDto, file);
  }

  @Get('getAllUserImgs/:userId')
  getAllUserImgs(@Param('userId') userId: string) {
    return this.imegsService.getAllUserImgs(userId);
  }

  @Get('getBiId/:userId/:imgId')
  getBiId(@Param('userId') userId: string, @Param('imgId') imgId: string) {
    return this.imegsService.getBiId(userId, imgId);
  }

  @Put('updateImg')
  @UseInterceptors(FileInterceptor('file'))
  updateImg(
    @Body() updateImeg: UpdateImegDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.imegsService.updateImg(updateImeg, file);
  }

  @Delete('delleteImgUser/:userId/:imgId')
  dellImg(@Param('userId') userId: string, @Param('imgId') imgId: string) {
    return this.imegsService.dellImg(userId, imgId);
  }

  @Post('dellImegs')
  dellImegs(@Body() dellImegDto: DellImegDto) {
    return this.imegsService.dellImegs(dellImegDto);
  }
}
