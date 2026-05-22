import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PhotoServis {
  saveIMG(OwnerId: string, src: string, file: Express.Multer.File): string {
    const uploadDir = path.join(process.cwd(), 'files', src, OwnerId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.originalname);
    if (fs.existsSync(filePath)) {
      throw new BadRequestException(
        `Файл с именем "${file.originalname}" уже существует в этой категории!`,
      );
    }
    fs.writeFileSync(filePath, file.buffer);
    return `files/${src}/${OwnerId}/${file.originalname}`;
  }
  getAbsoluteFilePath(src: string): string | null {
    const filePath = path.join(process.cwd(), src);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return filePath;
  }

  deleteIMG(relativeSrc: string): void {
    const absolutePath = path.join(process.cwd(), relativeSrc);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  renameIMG(oldRelativeSrc: string, newFileNameWithoutExt: string): string {
    const oldAbsolutePath = path.join(process.cwd(), oldRelativeSrc);

    if (!fs.existsSync(oldAbsolutePath)) {
      return oldRelativeSrc; // Если файла физически нет, возвращаем старый относительный путь
    }

    const fileDir = path.dirname(oldAbsolutePath);
    const fileExt = path.extname(oldAbsolutePath); // Получаем расширение (например, .jpg)
    const newAbsoluteName = path.join(
      fileDir,
      `${newFileNameWithoutExt}${fileExt}`,
    );

    // Переименовываем файл на жестком диске
    fs.renameSync(oldAbsolutePath, newAbsoluteName);

    // Возвращаем новый относительный путь для сохранения в MongoDB
    const relativeDir = path.dirname(oldRelativeSrc);
    return `${relativeDir}/${newFileNameWithoutExt}${fileExt}`;
  }
}
