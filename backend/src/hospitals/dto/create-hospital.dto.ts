import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHospitalDto {
  @ApiProperty({ example: 'Black Lion Hospital', description: 'Hospital name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    enum: ['HOSPITAL', 'HEALTH_CENTER', 'CLINIC'],
    example: 'HOSPITAL',
    description: 'Hospital type' 
  })
  @IsEnum(['HOSPITAL', 'HEALTH_CENTER', 'CLINIC'])
  type: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia', description: 'Hospital location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: '+251111234567', description: 'Contact information' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Associated woreda ID' })
  @IsMongoId()
  woredaId: string;
}
