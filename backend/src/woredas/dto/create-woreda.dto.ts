import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWoredaDto {
  @ApiProperty({ example: 'Addis Ababa Woreda 1', description: 'Woreda name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Addis Ababa', description: 'Region name' })
  @IsString()
  region: string;
}
