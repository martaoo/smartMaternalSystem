import { IsEmail, IsEnum, IsString, MinLength, IsOptional, IsMongoId, ValidateIf, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    enum: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN', 'MOTHER'],
    example: 'SYSTEM_ADMIN',
    description: 'User role' 
  })
  @IsEnum(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN', 'MOTHER'])
  role: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated hospital ID (for hospital staff - auto-assigned for Hospital Admin)' })
  @IsOptional()
  @IsMongoId()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated woreda ID (for woreda staff - auto-assigned for Hospital Admin)' })
  @IsOptional()
  @IsMongoId()
  woredaId?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa', description: 'Assigned region for SYSTEM_ADMIN' })
  @ValidateIf(o => ['SYSTEM_ADMIN'].includes(o.role))
  @IsString()
  assignedRegion?: string;

  @ApiPropertyOptional({ example: '+251911234567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
