import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;

  @ApiProperty({ example: 'mother' })
  role!: string;

  @ApiProperty({ required: false })
  hospitalId?: string;

  @ApiProperty({ required: false })
  woredaId?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4...' })
  token!: string;

  @ApiProperty({ example: 'newStrongP@ssw0rd' })
  newPassword!: string;
}
