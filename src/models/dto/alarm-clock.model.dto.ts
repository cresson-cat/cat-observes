import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AlarmClockDto {
  @ApiProperty({
    description: 'ファイル名の配列',
    example: ['file1.txt', 'file2.txt'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  files: string[];
}
