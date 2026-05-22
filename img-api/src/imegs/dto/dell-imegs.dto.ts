import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DellImegDto {
  @IsArray()
  @IsString()
  @IsNotEmpty()
  _id!: string[];

  @IsString()
  @IsNotEmpty()
  onerId!: string;
}
