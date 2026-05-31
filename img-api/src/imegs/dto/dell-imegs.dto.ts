import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteImgsDto {
  @IsArray()
  @IsString()
  @IsNotEmpty()
  _id!: string[];

  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}
