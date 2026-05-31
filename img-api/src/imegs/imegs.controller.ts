import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { ImegsService } from './imegs.service';
import { CreateImegDto } from './dto/create-imeg.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UpdateImegDto } from './dto/update-imeg.dto';
import { DeleteImgsDto } from './dto/dell-imegs.dto';

@Controller('imegs')
@UseGuards(JwtAuthGuard)
export class ImegsController {
  constructor(private readonly imegsService: ImegsService) {}

  @Post('image-items-create')
  @UseInterceptors(FilesInterceptor('file'))
  create(
    @Body() createImegDto: CreateImegDto,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    console.log(createImegDto);
    return this.imegsService.create(createImegDto, file);
  }

  @Get('image-items-all/:userId')
  getAllUserImgs(@Param('userId') userId: string) {
    return this.imegsService.getAllUserImgs(userId);
  }

  @Get('image-items/:imgId/download')
  downloadFile(@Param('imgId') imgId: string) {
    return this.imegsService.downloadFile(imgId);
  }

  @Put('image-items-update')
  @UseInterceptors(FilesInterceptor('image', 10))
  updateImg(
    @Body() updateImeg: UpdateImegDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.imegsService.updateImg(updateImeg, files);
  }

  @Delete('image-items-dell-one/:userId/:imgId')
  deleteImg(@Param('userId') userId: string, @Param('imgId') imgId: string) {
    return this.imegsService.deleteImg(userId, imgId);
  }

  @Post('image-items-dell-list')
  deleteImgs(@Body() dellImegDto: DeleteImgsDto) {
    return this.imegsService.deleteImgs(dellImegDto);
  }

  @Get('allOpenImg/:skip')
  allOpenImg(@Param('skip') skip: string) {
    return this.imegsService.allOpenImg(+skip);
  }
}
