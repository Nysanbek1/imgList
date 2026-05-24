import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImegDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  onerId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  forAllPeople?: boolean;
}
