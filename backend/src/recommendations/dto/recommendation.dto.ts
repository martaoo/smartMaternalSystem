import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ArrayUnique } from 'class-validator';

export class RecommendationRequestDto {
  @ApiProperty({
    description: 'Maternal clinical conditions or symptoms',
    type: [String],
    example: ['Anemia', 'High BP', 'Pregnancy after 5 months'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  conditions?: string[] = [];

  @ApiPropertyOptional({
    description: 'Baby-specific clinical conditions',
    type: [String],
    example: ['Jaundice'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  babyConditions?: string[] = [];

  @ApiPropertyOptional({
    description: 'Baby age in months',
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  babyAgeMonths?: number;

  @ApiPropertyOptional({
    description: 'Observed nutrient deficiency symptoms',
    type: [String],
    example: ['Pale skin', 'Low energy'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  deficiencies?: string[] = [];
}
