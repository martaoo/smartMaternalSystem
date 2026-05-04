import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSelfDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Required when changing password' })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({ minLength: 6, description: 'New password (requires currentPassword)' })
  @IsOptional()
  @ValidateIf((o) => o.newPassword !== undefined && o.newPassword !== '')
  @IsString()
  @MinLength(6)
  newPassword?: string;
}
