import { IsEmail, IsEnum, IsString, MinLength, IsOptional, IsMongoId, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  name: string;

  @ApiProperty({ 
    enum: ['MOH_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER', 'MOTHER'],
    example: 'DOCTOR',
    description: 'User role' 
  })
  @IsEnum(['MOH_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER', 'MOTHER'])
  role: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Hospital ID (required for HOSPITAL_ADMIN, DOCTOR, NURSE, DISPATCHER)' })
  @ValidateIf(o => ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER'].includes(o.role))
  @IsMongoId()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Woreda ID (required for WOREDA_ADMIN, HOSPITAL_ADMIN)' })
  @ValidateIf(o => ['WOREDA_ADMIN', 'HOSPITAL_ADMIN'].includes(o.role))
  @IsMongoId()
  woredaId?: string;

  @ApiPropertyOptional({ example: '+251900000001', description: 'User phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Obstetrics', description: 'Department (required for DOCTOR, NURSE)' })
  @ValidateIf(o => ['DOCTOR', 'NURSE'].includes(o.role))
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'MD001234', description: 'License number (required for DOCTOR, NURSE)' })
  @ValidateIf(o => ['DOCTOR', 'NURSE'].includes(o.role))
  @IsString()
  licenseNumber?: string;
}

