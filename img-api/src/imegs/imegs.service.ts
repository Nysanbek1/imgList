import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateImegDto } from './dto/create-imeg.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Imeg } from './entities/imeg.entity';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { PhotoServis } from 'src/servis/photo';
import { UpdateImegDto } from './dto/update-imeg.dto';
import { DeleteImgsDto } from './dto/dell-imegs.dto';

@Injectable()
export class ImegsService {
  constructor(
    @InjectModel(Imeg.name)
    private readonly imegs: Model<Imeg>,
    @InjectModel(User.name)
    private readonly users: Model<User>,
    private readonly photo: PhotoServis,
  ) {}
  async create(createImegDto: CreateImegDto, file: Express.Multer.File[]) {
    if (!file || file.length == 0) {
      throw new UnauthorizedException(
        'Файл изображения обязателен для загрузки',
      );
    }
    const { name, ownerId, description, forAllPeople } = createImegDto;
    const ownerIdObjID = new Types.ObjectId(ownerId);
    const imgFind = await this.imegs
      .findOne({
        name: name,
        ownerId: ownerIdObjID,
      })
      .lean()
      .exec();
    if (imgFind) {
      throw new UnauthorizedException('Такое имя уже занято');
    }
    const newImg = await this.imegs.create({
      name: name,
      ownerId: ownerIdObjID,
      description: description,
      imagePath: this.photo.saveIMG(ownerId, 'userPostPhoto', file, name),
      forAllPeople: forAllPeople,
    });
    if (!newImg) {
      throw new UnauthorizedException('ошбка');
    }
    return true;
  }

  async getAllUserImgs(userId: string) {
    const ownerIdObjID = new Types.ObjectId(userId);
    const allImgImfo = await this.imegs
      .find({ ownerId: ownerIdObjID })
      .select('-__v')
      .lean()
      .exec();
    if (!allImgImfo) {
      return [];
    }
    const fileRes = allImgImfo.map((img) => {
      const imagePath = img.imagePath.map(
        (res) => `http://localhost:3010/${res}`,
      );
      return {
        ...img,
        imagePath: imagePath,
      };
    });
    return fileRes;
  }

  async downloadFile(imgId: string) {
    const imgIdObjID = new Types.ObjectId(imgId);

    const imgRecord = await this.imegs
      .findOne({ _id: imgIdObjID })
      .select('-__v')
      .lean()
      .exec();

    if (!imgRecord) {
      throw new NotFoundException('Запись об изображении не найдена');
    }
    const fileRes = imgRecord.imagePath.map(
      (res) => `http://localhost:3010/${res}`,
    );
    return fileRes;
  }

  async updateImg(updateImeg: UpdateImegDto, files?: Express.Multer.File[]) {
    const { name, _id, ownerId, description, forAllPeople } = updateImeg;
    const imgId = new Types.ObjectId(_id);
    const ownerIdObjID = new Types.ObjectId(ownerId);

    const imgFind = await this.imegs
      .findOne({ _id: imgId, ownerId: ownerIdObjID })
      .lean()
      .exec();

    if (!imgFind) {
      throw new NotFoundException('Изображение не найдено');
    }

    const oldName = imgFind.name;
    let finalName = oldName;
    let newImagePaths = imgFind.imagePath;
    let filesWereSaved = false;

    // 2. Валидация изменения имени
    if (name !== undefined && oldName !== name) {
      const nameTest = await this.imegs
        .findOne({ ownerId: ownerIdObjID, name: name })
        .lean()
        .exec();

      if (nameTest) {
        throw new BadRequestException(
          'Пост с таким именем уже существует у данного пользователя',
        );
      }
      finalName = name;
    }

    if (files && files.length > 0) {
      newImagePaths = this.photo.saveIMG(
        ownerId,
        'userPostPhoto',
        files,
        finalName,
      );
      filesWereSaved = true;
    } else if (oldName !== finalName) {
      newImagePaths = this.photo.renamePostDir(
        ownerId,
        'userPostPhoto',
        oldName,
        finalName,
        imgFind.imagePath,
      );
    }

    try {
      // 4. Записываем обновленные данные в базу
      const updateResult = await this.imegs
        .findOneAndUpdate(
          { _id: imgId, ownerId: ownerIdObjID },
          {
            $set: {
              name: finalName,
              description: description ?? imgFind.description,
              imagePath: newImagePaths,
              forAllPeople: forAllPeople ?? imgFind.forAllPeople,
            },
          },
          { new: true },
        )
        .lean()
        .exec();

      if (!updateResult) {
        throw new Error('Документ не был обновлен в MongoDB');
      }

      if (filesWereSaved && imgFind.imagePath && imgFind.imagePath.length > 0) {
        imgFind.imagePath.forEach((path) => {
          try {
            this.photo.deleteIMG(path);
          } catch (e) {
            console.error(
              `Предупреждение: Не удалось удалить старый файл при успешном апдейте: ${path}`,
              e,
            );
          }
        });
        if (oldName !== finalName) {
          this.photo.deletePostDir(ownerId, 'userPostPhoto', oldName);
        }
      }

      return true;
    } catch {
      if (filesWereSaved && newImagePaths && newImagePaths.length > 0) {
        newImagePaths.forEach((path) => {
          try {
            this.photo.deleteIMG(path);
          } catch (e) {
            console.error(
              `Не удалось откатить новые файлы при упавшем апдейте: ${path}`,
              e,
            );
          }
        });
        this.photo.deletePostDir(ownerId, 'userPostPhoto', finalName);
      }

      throw new InternalServerErrorException(
        'Ошибка при обновлении данных в БД. Изменения на диске откатаны.',
      );
    }
  }

  async deleteImg(userId: string, imgId: string) {
    const ownerIdObjID = new Types.ObjectId(userId);
    const imgIdObjID = new Types.ObjectId(imgId);
    const imgFind = await this.imegs
      .findOne({
        _id: imgIdObjID,
        ownerId: ownerIdObjID,
      })
      .lean()
      .exec();
    if (!imgFind) {
      throw new NotFoundException('IMG не найден');
    }
    const dell = await this.imegs
      .deleteOne({
        _id: imgFind._id,
        ownerId: ownerIdObjID,
      })
      .lean()
      .exec();

    if (dell) {
      this.photo.deletePostDir(userId, 'userPostPhoto', imgFind.name);
    } else {
      throw new UnauthorizedException('что то пошло не так');
    }

    return true;
  }

  async deleteImgs(deleteImgsDto: DeleteImgsDto): Promise<boolean> {
    if (!deleteImgsDto || deleteImgsDto._id.length === 0) {
      return false;
    }
    const imgIdObjID = new Types.ObjectId(deleteImgsDto.ownerId);
    const searchConditions = deleteImgsDto._id.map((item) => ({
      _id: new Types.ObjectId(item),
    }));
    const resDellList = await this.imegs
      .find({ $or: searchConditions, ownerId: imgIdObjID })
      .lean()
      .exec();
    if (!resDellList || resDellList.length === 0) {
      throw new NotFoundException(
        'Изображения не найдены или у вас нет прав на их удаление',
      );
    }
    const validIdsToDelete = resDellList.map((img) => img._id);
    const deleteResult = await this.imegs.deleteMany({
      _id: { $in: validIdsToDelete },
    });
    if (deleteResult.deletedCount > 0) {
      for (const res of resDellList) {
        if (res.imagePath && Array.isArray(res.imagePath)) {
          res.imagePath.forEach((pathStr) => {
            this.photo.deleteIMG(pathStr);
          });
        }
        if (res.name) {
          this.photo.deletePostDir(
            deleteImgsDto.ownerId,
            'userPostPhoto',
            res.name,
          );
        }
      }
    }
    return true;
  }

  async allOpenImg(skip: number) {
    const img = await this.imegs
      .find({ forAllPeople: true })
      .skip(skip)
      .limit(20)
      .lean()
      .exec();
    const imgsRes = await Promise.all(
      img.map(async (res) => {
        const user = await this.users
          .findOne({ _id: res.ownerId })
          .lean()
          .exec();
        return {
          ...res,
          nameUser: user?.name,
        };
      }),
    );
    return imgsRes;
  }
}
