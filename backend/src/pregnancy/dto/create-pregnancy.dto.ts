import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePregnancyDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Mother ID' })
  @IsMongoId()
  motherId: string;

  @ApiProperty({ example: 24, description: 'Pregnancy week' })
  @IsNumber()
  @Min(1)
  @Max(42)
  week: number;

  @ApiProperty({ example: 24, description: 'Gestational age in weeks' })
  @IsNumber()
  @Min(1)
  @Max(42)
  gestationalAge: number;

  @ApiPropertyOptional({ example: 120, description: 'Systolic blood pressure' })
  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(200)
  systolicBP?: number;

  @ApiPropertyOptional({ example: 80, description: 'Diastolic blood pressure' })
  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(130)
  diastolicBP?: number;

  @ApiPropertyOptional({ example: 65.5, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @ApiPropertyOptional({ example: 24, description: 'Fundal height in cm' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(50)
  fundalHeight?: number;

  @ApiPropertyOptional({ example: 140, description: 'Fetal heart rate' })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(180)
  fetalHeartRate?: number;

  @ApiPropertyOptional({ example: 'Cephalic', description: 'Fetal presentation' })
  @IsOptional()
  @IsString()
  presentation?: string;

  @ApiPropertyOptional({ example: 'Mother feeling well, normal fetal movements', description: 'Visit notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MODERATE', 'HIGH'], example: 'LOW', description: 'Risk level assessment' })
  @IsOptional()
  @IsEnum(['LOW', 'MODERATE', 'HIGH'])
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';

  @ApiPropertyOptional({ example: ['Nausea', 'Mild back pain'], description: 'Symptoms reported' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @ApiPropertyOptional({ example: ['Folic acid', 'Iron supplements'], description: 'Medications prescribed' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({ example: '2024-04-15', description: 'Next scheduled visit date' })
  @IsOptional()
  @IsDateString()
  nextVisitDate?: string;

  @ApiPropertyOptional({ example: 'Normal fetal development, adequate amniotic fluid', description: 'Ultrasound findings' })
  @IsOptional()
  @IsString()
  ultrasoundFindings?: string;

  @ApiPropertyOptional({ 
    example: { hemoglobin: 12.5, urineProtein: 'Negative', bloodSugar: 95 },
    description: 'Laboratory results' 
  })
  @IsOptional()
  labResults?: {
    hemoglobin?: number;
    urineProtein?: string;
    bloodSugar?: number;
    hiv?: string;
    syphilis?: string;
  };

  @ApiPropertyOptional({ example: ['Mild anemia'], description: 'Any complications identified' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complications?: string[];

  @ApiPropertyOptional({ example: 'Continue iron supplements, increase fluid intake', description: 'Recommendations' })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional({ example: false, description: 'Emergency visit flag' })
  @IsOptional()
  emergency?: boolean;

  @ApiPropertyOptional({ example: 'Severe headache, elevated BP', description: 'Emergency reason if applicable' })
  @IsOptional()
  @IsString()
  emergencyReason?: string;
}
