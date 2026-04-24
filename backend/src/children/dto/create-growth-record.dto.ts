import { IsString, IsEnum, IsOptional, IsMongoId, IsNumber, Min, Max, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGrowthRecordDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Child ID' })
  @IsMongoId()
  childId: string;

  @ApiProperty({ example: 6, description: 'Child age in months' })
  @IsNumber()
  @Min(0)
  @Max(60)
  ageMonths: number;

  @ApiProperty({ example: 7.2, description: 'Weight in kg' })
  @IsNumber()
  @Min(1)
  @Max(50)
  weight: number;

  @ApiProperty({ example: 65.5, description: 'Height in cm' })
  @IsNumber()
  @Min(30)
  @Max(150)
  height: number;

  @ApiPropertyOptional({ example: 42.5, description: 'Head circumference in cm' })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(60)
  headCircumference?: number;

  @ApiPropertyOptional({ example: 35.2, description: 'Chest circumference in cm' })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(80)
  chestCircumference?: number;

  @ApiPropertyOptional({ example: 14.5, description: 'MUAC in cm' })
  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(25)
  muac?: number;

  @ApiPropertyOptional({ enum: ['SEVERE_UNDERWEIGHT', 'MODERATE_UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE'], description: 'Growth status' })
  @IsOptional()
  @IsEnum(['SEVERE_UNDERWEIGHT', 'MODERATE_UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE'])
  growthStatus?: 'SEVERE_UNDERWEIGHT' | 'MODERATE_UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';

  @ApiPropertyOptional({ enum: ['SEVERE_STUNTING', 'MODERATE_STUNTING', 'NORMAL', 'TALL'], description: 'Height status' })
  @IsOptional()
  @IsEnum(['SEVERE_STUNTING', 'MODERATE_STUNTING', 'NORMAL', 'TALL'])
  heightStatus?: 'SEVERE_STUNTING' | 'MODERATE_STUNTING' | 'NORMAL' | 'TALL';

  @ApiPropertyOptional({ enum: ['SEVERE_WASTING', 'MODERATE_WASTING', 'NORMAL', 'OVERWEIGHT'], description: 'Weight status' })
  @IsOptional()
  @IsEnum(['SEVERE_WASTING', 'MODERATE_WASTING', 'NORMAL', 'OVERWEIGHT'])
  weightStatus?: 'SEVERE_WASTING' | 'MODERATE_WASTING' | 'NORMAL' | 'OVERWEIGHT';

  @ApiPropertyOptional({ enum: ['RED', 'YELLOW', 'GREEN'], description: 'MUAC status' })
  @IsOptional()
  @IsEnum(['RED', 'YELLOW', 'GREEN'])
  muacStatus?: 'RED' | 'YELLOW' | 'GREEN';

  @ApiPropertyOptional({ example: 'Exclusive breastfeeding', description: 'Feeding pattern' })
  @IsOptional()
  @IsString()
  feedingPattern?: string;

  @ApiPropertyOptional({ example: ['Can sit without support', 'Babbles'], description: 'Developmental milestones' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  developmentalMilestones?: string[];

  @ApiPropertyOptional({ example: ['BCG', 'OPV 1'], description: 'Immunizations received' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  immunizationsReceived?: string[];

  @ApiPropertyOptional({ example: ['Mild diaper rash'], description: 'Health concerns' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthConcerns?: string[];

  @ApiPropertyOptional({ example: 'Continue exclusive breastfeeding, return for follow-up in 1 month', description: 'Recommendations' })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional({ example: '2024-04-15', description: 'Follow-up date if needed' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ example: 'Child growing well, no concerns', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
