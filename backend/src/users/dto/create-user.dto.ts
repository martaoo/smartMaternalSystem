import { IsEmail, IsEnum, IsString, MinLength, IsOptional, IsMongoId, ValidateIf, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

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
    enum: UserRole,
    example: UserRole.SYSTEM_ADMIN,
    description: 'User role' 
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Obstetrics', description: 'Department name for healthcare workers' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'MD001234', description: 'License number for doctors and nurses' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated hospital ID (for hospital staff - auto-assigned for Hospital Admin)' })
  @ValidateIf(o => ['HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'LIAISON_OFFICER', 'HOSPITAL_APPROVER', 'GATEKEEPER', 'SPECIALIST'].includes(o.role))
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated health center ID (alias of hospitalId)' })
  @ValidateIf(o => ['HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'LIAISON_OFFICER', 'HOSPITAL_APPROVER', 'GATEKEEPER', 'SPECIALIST'].includes(o.role) && !o.hospitalId)
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  healthCenterId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated woreda ID (for woreda staff - auto-assigned for Hospital Admin)' })
  @ValidateIf(o => ['WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN'].includes(o.role))
  @IsString()
  @IsNotEmpty()
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
