import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
export class AlarmClockDto {
  @ApiProperty({ type: [String], description: 'ファイル名の配列' })
  @IsNotEmpty()
  @IsArray()
  files: string[];
}
