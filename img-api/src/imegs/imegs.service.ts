import {
  Injectable,
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
import { DellImegDto } from './dto/dell-imegs.dto';

@Injectable()
export class ImegsService {

  constructor(
    @InjectModel(Imeg.name)
    private readonly imegs: Model<Imeg>,
    @InjectModel(User.name)
    private readonly users: Model<User>,
    private readonly photo: PhotoServis,
  ) {}
  async create(createImegDto: CreateImegDto, file: Express.Multer.File) {
    if (!file) {
      throw new UnauthorizedException(
        'Файл изображения обязателен для загрузки',
      );
    }
    const { name, onerId, description, forAllPeople } = createImegDto;
    const onerIdObjID = new Types.ObjectId(onerId);
    const imgTest = await this.imegs
      .findOne({
        name: name,
        onerId: onerIdObjID,
      })
      .lean()
      .exec();
    if (imgTest) {
      throw new UnauthorizedException('Такое имя уже занято');
    }

    const imagePath = this.photo.saveIMG(onerId, 'userPostPhoto', file);
    const newImg = await this.imegs.create({
      name: name,
      onerId: onerIdObjID,
      description: description,
      imagePath: imagePath,
      forAllPeople: forAllPeople,
    });
    if (!newImg) {
      throw new UnauthorizedException('ошбка');
    }
    return true;
  }

  async getAllUserImgs(userId: string) {
    const onerIdObjID = new Types.ObjectId(userId);
    const allImgImfo = await this.imegs
      .find({ onerId: onerIdObjID })
      .select('-__v')
      .lean()
      .exec();
    if (!allImgImfo) {
      return [];
    }
    const fileRes = allImgImfo.map((img) => {
      return {
        ...img,
        imagePath: `http://localhost:3010/${img.imagePath}`,
      };
    });
    return fileRes;
  }

  async getBiId(userId: string, imgId: string) {
    const onerIdObjID = new Types.ObjectId(userId);
    const imgIdObjID = new Types.ObjectId(imgId);
    const imgImfo = await this.imegs
      .findOne({ _id: imgIdObjID, onerId: onerIdObjID })
      .select('-__v')
      .lean()
      .exec();
    if (!imgImfo) {
      return {};
    }
    return {
      ...imgImfo,
      imagePath: `http://localhost:3010/${imgImfo.imagePath}`,
    };
  }

  async updateImg(updateImeg: UpdateImegDto, file?: Express.Multer.File) {
    const { name, _id, onerId, description, forAllPeople } = updateImeg;
    const imgId = new Types.ObjectId(_id);
    const onerIdObjID = new Types.ObjectId(onerId);
    const imgTest = await this.imegs
      .findOne({
        _id: imgId,
        onerId: onerIdObjID,
      })
      .lean()
      .exec();
    if (!imgTest) {
      throw new NotFoundException('IMG не найден');
    }
    const oldName = imgTest.name;
    if (name !== undefined && oldName !== name) {
      const nameTest = await this.imegs
        .findOne({
          onerId: onerIdObjID,
          name: name,
        })
        .lean()
        .exec();
      if (nameTest) {
        throw new UnauthorizedException('ошбка');
      }
      imgTest.name = name;
    }
    if (file) {
      this.photo.deleteIMG(imgTest.imagePath);
      const newImagePath = this.photo.saveIMG(onerId, 'userPostPhoto', file);
      imgTest.imagePath = newImagePath;
    } else {
      const newImagePath = this.photo.renameIMG(imgTest.imagePath, name);
      imgTest.imagePath = newImagePath;
    }
    imgTest.description = description;
    imgTest.forAllPeople = forAllPeople ?? false;
    const updateImg = await this.imegs
      .findOneAndUpdate(
        {
          _id: imgId,
          onerId: onerIdObjID,
        },
        {
          $set: {
            name: imgTest.name,
            description: imgTest.description,
            imagePath: imgTest.imagePath,
            forAllPeople: imgTest.forAllPeople,
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec();
    if (!updateImg) {
      throw new UnauthorizedException('что то пошло не так');
    }
    return true;
  }

  async dellImg(userId: string, imgId: string) {
    const onerIdObjID = new Types.ObjectId(userId);
    const imgIdObjID = new Types.ObjectId(imgId);
    const imgTest = await this.imegs
      .findOne({
        _id: imgIdObjID,
        onerId: onerIdObjID,
      })
      .lean()
      .exec();
    if (!imgTest) {
      throw new NotFoundException('IMG не найден');
    }
    const dell = await this.imegs
      .deleteOne({
        _id: imgTest._id,
        onerId: onerIdObjID,
      })
      .lean()
      .exec();

    if (dell) {
      this.photo.deleteIMG(imgTest.imagePath);
    } else {
      throw new UnauthorizedException('что то пошло не так');
    }

    return true;
  }

  async dellImegs(dellImegDto: DellImegDto): Promise<boolean> {
    if (!dellImegDto || dellImegDto._id.length === 0) {
      return false;
    }
    const imgIdObjID = new Types.ObjectId(dellImegDto.onerId);
    const searchConditions = dellImegDto._id.map((item) => ({
      _id: new Types.ObjectId(item),
    }));
    const resDellList = await this.imegs
      .find({ $or: searchConditions, onerId: imgIdObjID })
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
        if (res.imagePath) {
          this.photo.deleteIMG(res.imagePath);
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
          .findOne({ _id: res.onerId })
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
