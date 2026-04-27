import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsMongoId,
  IsPhoneNumber,
  Length,
  ValidateIf,
  IsDateString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { UrgencyLevel, ReferralStatus } from 'src/common/enums/referral-status.enum';
import { CreateMotherDto } from '@/mothers/dto/create-mother.dto';

// ─────────────────────────────────────────
// CREATE REFERRAL DTO
// ─────────────────────────────────────────
export class CreateReferralDto {
  @IsMongoId()
  @IsNotEmpty()
  fromHospital: string;

  @IsOptional()
  @IsMongoId()
  motherId?: string; // Correctly typed as string for existing records

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateMotherDto)
  mother?: CreateMotherDto; // Correctly typed for new mother creation

  @IsString()
  @IsNotEmpty()
  doctorName: string;

  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsPhoneNumber('ET')
  patientPhone: string;

  @IsEnum(UrgencyLevel)
  urgency: UrgencyLevel;

  @IsString()
  @IsNotEmpty()
  reasonForReferral: string;

  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsMongoId()
  @IsOptional()
  toHospital?: string;

  // Optional operational fields
  @IsOptional()
  @IsString()
  requiredSpecialty?: string;

  @IsOptional()
  @IsString()
  requiredBedType?: string;
}

// ─────────────────────────────────────────
// SUBMIT FEEDBACK DTO
// ─────────────────────────────────────────
export class SubmitFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 2000)
  feedbackNote: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  finalAttachments?: string[];
}

// ─────────────────────────────────────────
// GATE CHECK-IN DTO
// ─────────────────────────────────────────
export class GateCheckInDto {
  @IsString()
  @IsNotEmpty()
  referralCode: string;
}

// ─────────────────────────────────────────
// RESPOND TO REFERRAL DTO
// ─────────────────────────────────────────
export class RespondReferralDto {
  @IsEnum(ReferralStatus)
  status: ReferralStatus;

  @IsOptional()
  @IsString()
  targetDepartment?: string;

  @ValidateIf(o => o.status === ReferralStatus.REJECTED)
  @IsNotEmpty({ message: 'A justification is required when rejecting a referral' })
  @IsString()
  justification?: string;

  @IsOptional()
  @IsDateString()
  appointmentDate?: string;
}

// ─────────────────────────────────────────
// UNLOCK REFERRAL DTO
// ─────────────────────────────────────────
export class UnlockReferralDto {
  @IsString()
  @IsNotEmpty()
  referralCode: string;

  @IsString()
  @Length(6, 6)
  @IsOptional()
  otp?: string;
}