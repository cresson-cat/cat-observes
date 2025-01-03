import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CatFoodDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  @IsNotEmpty()
  contractNum: number;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  branchName: string;
}
