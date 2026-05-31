import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateImegDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  _id!: string;

  @IsNotEmpty()
  @IsString()
  ownerId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  forAllPeople?: boolean;
}
