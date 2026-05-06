import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, IsDateString, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMotherDto {
  @ApiProperty({ example: 'Abeba Kebede', description: 'Mother full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+251911234567', description: 'Mother age' })
  @IsNumber()
  @Min(15)
  @Max(50)
  age: number;

  @ApiProperty({ example: 'Addis Ababa, Bole, Street 123', description: 'Home address' })
  @IsString()
  address: string;

 email?: string;
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

  @ApiPropertyOptional({ example: 'O+', description: 'Mother blood type' })
  @IsOptional()
  @IsEnum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-'])
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-';

  @ApiPropertyOptional({ example: 'Dr. Sarah Johnson - Nurse', description: 'Name and role of person who registered the mother' })
  @IsOptional()
  @IsString()
  registeredBy?: string;

  @ApiPropertyOptional({ example: 'Positive', description: 'RH Factor blood type' })
  @IsOptional()
  @IsString()
  rhFactor?: string;

  @ApiPropertyOptional({ example: 'Negative', description: 'HIV status' })
  @IsOptional()
  @IsString()
  hivStatus?: string;

  @ApiPropertyOptional({ example: 'Negative', description: 'Hepatitis B status' })
  @IsOptional()
  @IsString()
  hepatitisB?: string;

  @ApiPropertyOptional({ example: false, description: 'Has hypertension' })
  @IsOptional()
  @IsBoolean()
  hypertension?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Has diabetes' })
  @IsOptional()
  @IsBoolean()
  diabetes?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Has anemia' })
  @IsOptional()
  @IsBoolean()
  anemia?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Previous C-section' })
  @IsOptional()
  @IsBoolean()
  previousCSection?: boolean;

  @ApiProperty({ example: '69f9b3406f75dfcd97902d06', description: 'Woreda ID where the mother belongs' })
  @IsMongoId()
  woredaId: string;

  @ApiProperty({ example: '69f9b3836f75dfcd97902d8e', description: 'Health center ID where the mother is registered' })
  @IsMongoId()
  healthCenter: string;

  @ApiProperty({ example: 'mother_1234567890_abc123', description: 'Temporary username for mobile app login' })
  @IsString()
  tempUsername: string;

  @ApiProperty({ example: 'tempPass123', description: 'Temporary password for mobile app login' })
  @IsString()
  tempPassword: string;

  @ApiProperty({ example: '+251911234567', description: 'Phone number for SMS delivery' })
  @IsString()
  phone: string;
}
