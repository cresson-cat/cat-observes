import { IsArray, IsNotEmpty } from 'class-validator';

export class AlarmClockDto {
  @IsNotEmpty()
  @IsArray()
  files: string[];
}
