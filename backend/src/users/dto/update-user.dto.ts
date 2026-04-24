import { IsEmail, IsEnum, IsString, MinLength, IsOptional, IsMongoId, ValidateIf, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'User email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'password123', minLength: 6, description: 'User password (leave blank to keep current password)' })
  @IsOptional()
  @ValidateIf(o => o.password !== undefined && o.password !== '')
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ 
    enum: UserRole,
    example: UserRole.SYSTEM_ADMIN,
    description: 'User role' 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Obstetrics', description: 'Department name for healthcare workers' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'MD001234', description: 'License number for doctors and nurses' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated hospital ID (for hospital staff)' })
  @IsOptional()
  @ValidateIf(o => o.hospitalId !== undefined && o.hospitalId !== '')
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Associated woreda ID (for woreda staff)' })
  @IsOptional()
  @ValidateIf(o => o.woredaId !== undefined && o.woredaId !== '')
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  woredaId?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa', description: 'Assigned region for SYSTEM_ADMIN' })
  @IsOptional()
  @ValidateIf(o => o.assignedRegion !== undefined && o.assignedRegion !== '')
  @IsString()
  assignedRegion?: string;

  @ApiPropertyOptional({ example: '+251911234567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
