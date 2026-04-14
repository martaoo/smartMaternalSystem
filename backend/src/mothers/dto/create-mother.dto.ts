import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMotherDto {
  @ApiProperty({ example: 'Abeba Kebede', description: 'Mother full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+251911234567', description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 28, description: 'Mother age' })
  @IsNumber()
  @Min(15)
  @Max(50)
  age: number;

  @ApiProperty({ example: 'Addis Ababa, Bole, Street 123', description: 'Home address' })
  @IsString()
  address: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Health center ID' })
  @IsMongoId()
  healthCenter: string;

  @ApiPropertyOptional({ example: '+251911234568', description: 'Emergency contact number' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: 'No known allergies, previous cesarean section', description: 'Medical history' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiPropertyOptional({ example: '2024-12-01', description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 2, description: 'Number of pregnancies (gravida)' })
  @IsOptional()
  @IsNumber()
  gravida?: number;

  @ApiPropertyOptional({ example: 1, description: 'Number of previous births (para)' })
  @IsOptional()
  @IsNumber()
  para?: number;

  @ApiPropertyOptional({ example: '2024-03-15', description: 'Last menstrual period date' })
  @IsOptional()
  @IsDateString()
  lmp?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012', description: 'Assigned health worker ID' })
  @IsOptional()
  @IsMongoId()
  assignedHealthWorker?: string;
}
