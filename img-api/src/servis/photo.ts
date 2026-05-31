import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PhotoServis {
  saveIMG(
    OwnerId: string,
    src: string,
    files: Express.Multer.File[],
    name: string,
  ): string[] {
    if (!files || files.length === 0) return [];
    const savedPaths: string[] = [];

    const uploadDir = path.join(process.cwd(), 'files', src, OwnerId, name);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    files.forEach((file) => {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);

      const newFileName = `${baseName}${ext}`;
      const filePath = path.join(uploadDir, newFileName);

      if (fs.existsSync(filePath)) {
        throw new BadRequestException(
          `Файл с именем "${newFileName}" уже существует!`,
        );
      }

      fs.writeFileSync(filePath, file.buffer);
      savedPaths.push(`files/${src}/${OwnerId}/${name}/${newFileName}`);
    });

    return savedPaths;
  }

  renamePostDir(
    OwnerId: string,
    src: string,
    oldName: string,
    newName: string,
    imagePaths: string[],
  ): string[] {
    const oldDir = path.join(process.cwd(), 'files', src, OwnerId, oldName);
    const newDir = path.join(process.cwd(), 'files', src, OwnerId, newName);

    if (fs.existsSync(oldDir) && oldName !== newName) {
      fs.renameSync(oldDir, newDir);
    }

    return imagePaths.map((oldPath) => {
      return oldPath.replace(
        `files/${src}/${OwnerId}/${oldName}`,
        `files/${src}/${OwnerId}/${newName}`,
      );
    });
  }

  deleteIMG(relativeSrc: string): void {
    const absolutePath = path.join(process.cwd(), relativeSrc);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  deletePostDir(OwnerId: string, src: string, name: string): void {
    const absolutePath = path.join(process.cwd(), 'files', src, OwnerId, name);
    if (fs.existsSync(absolutePath)) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
    }
  }
}
