import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWoredaDto {
  @ApiProperty({ example: 'Woreda 01', description: 'Woreda name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Bole', description: 'City or Subcity name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Region ID' })
  @IsString()
  @IsNotEmpty()
  regionId: string;
}
