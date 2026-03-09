import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(['ambulance', 'midwife', 'wered'])
  role: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  department?: string;

  @IsString()
  licenseNumber?: string;
}
