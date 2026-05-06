import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Req, BadRequestException, Get, ForbiddenException, Query } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { 
  CreateReferralDto, 
  RespondReferralDto, 
  UnlockReferralDto, 
  GateCheckInDto, 
  SubmitFeedbackDto
} from './dto/referralDto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // JWT guard
import { RolesGuard } from 'src/common/guards/roles.guard';  // Optional role-based guard
import { Roles } from 'src/common/decorators/roles.decorator'; 
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('referrals')
@UseGuards(JwtAuthGuard, RolesGuard) // JWT + role checks
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // ────────────── DOCTOR ──────────────
@Post()
@Roles(UserRole.DOCTOR, UserRole.LIAISON_OFFICER, UserRole.NURSE, UserRole.MIDWIFE)
async createReferral(@Body() dto: CreateReferralDto, @Req() req) {
  // 1. Extract info from the JWT (req.user)
  // Ensure your AuthGuard/Strategy populates these fields
  const userId = req.user.id || req.user._id || req.user.sub;
  const hospitalId = req.user.hospitalId;
  const doctorName = req.user.fullName || req.user.name;
  const userRole = req.user.role;

  if (!userId || !hospitalId) {
    throw new BadRequestException('User identification or Hospital ID missing from token');
  }

  // 2. Pass userId, hospitalId, doctorName, and userRole to the service
  return this.referralsService.createReferral(dto, userId, hospitalId, doctorName, userRole);
}
@Post('system')
@Roles(UserRole.SYSTEM_ADMIN)
async createSystemReferral(@Body() dto, @Req() req) {
  return this.referralsService.createSystemReferral(dto);
}
// ────────────── LIAISON OFFICER / DOCTOR ──────────────
@Patch(':id/send')
@Roles(UserRole.LIAISON_OFFICER, UserRole.DOCTOR, UserRole.NURSE, UserRole.MIDWIFE)
async finalizeAndSend(
  @Param('id') id: string,
  @Body('targetHospitalId') targetHospitalId: string,
  @Body('liaisonNote') liaisonNote: string,
  @Req() req,
) {
  // Using consistent naming from the request object
  const actorId = req.user.id || req.user._id;
  const hospitalId = req.user.hospitalId;
  const actorName = req.user.fullName || req.user.name;

  return this.referralsService.finalizeAndSend(
    id, 
    actorId, 
    hospitalId, 
    targetHospitalId, 
    actorName,
    liaisonNote,
  );
}
@Get('incoming')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LIAISON_OFFICER, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.MIDWIFE)
async getIncoming(@Req() req) {
  // req.user is populated by the JwtStrategy after verifying the token
  const hospitalId = req.user.hospitalId; 
  
  if (!hospitalId) {
    throw new ForbiddenException('User is not assigned to a hospital');
  }

  return this.referralsService.getIncomingReferrals(hospitalId);
}

@Get('checked-in')
@Roles(
  UserRole.LIAISON_OFFICER,
  UserRole.HOSPITAL_ADMIN,
  UserRole.DOCTOR,
  UserRole.NURSE,
  UserRole.MIDWIFE,
)
async getCheckedIn(@Req() req) {
  const hospitalId = req.user.hospitalId;
  if (!hospitalId) {
    throw new ForbiddenException('User is not assigned to a hospital');
  }
  return this.referralsService.getCheckedInReferrals(hospitalId);
}
  // ────────────── RECEIVING HOSPITAL / LIAISON ──────────────
  @Patch(':id/respond')
  @Roles(
    UserRole.LIAISON_OFFICER,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.MIDWIFE,

  )
  async respondToReferral(
    @Param('id') id: string,
    @Body() dto: RespondReferralDto,
    @Req() req,
  ) {
    return this.referralsService.respondToReferral(id, 
    dto, 
    req.user.id,          // responderId
    req.user.hospitalId);
  }

  @Patch(':id')
  @Roles(UserRole.LIAISON_OFFICER, UserRole.DOCTOR, UserRole.NURSE, UserRole.MIDWIFE)
  async updateReferral(
    @Param('id') id: string,
    @Body() dto: CreateReferralDto,
    @Req() req,
  ) {
    return this.referralsService.updateReferral(id, dto, req.user.hospitalId);
  }

  @Delete(':id')
  @Roles(UserRole.LIAISON_OFFICER, UserRole.DOCTOR, UserRole.NURSE, UserRole.MIDWIFE)
  async deleteReferral(@Param('id') id: string, @Req() req) {
    return this.referralsService.deleteReferral(id, req.user.hospitalId);
  }

  // ────────────── GATE / SECURITY OFFICER ──────────────
  @Patch('gate-check-in')
  @Roles(UserRole.LIAISON_OFFICER) // Gate officers can be a separate role if needed
  async gateCheckIn(@Body() dto: GateCheckInDto, @Req() req) {
    console.log('CONTROLLER: gateCheckIn called', { dto, userId: req.user.id, hospitalId: req.user.hospitalId });
    try {
      const result = await this.referralsService.gateCheckIn(dto, req.user.id, req.user.hospitalId?.toString());
      console.log('CONTROLLER: gateCheckIn successful');
      return result;
    } catch (error) {
      console.error('CONTROLLER: gateCheckIn error:', error);
      throw error;
    }
  }

  // ────────────── SPECIALIST / NURSE / MIDWIFE ──────────────
  @Post('unlock')
  @Roles(UserRole.DOCTOR , UserRole.NURSE, UserRole.MIDWIFE)
  async unlockReferral(@Body() dto: UnlockReferralDto, @Req() req) {
    return this.referralsService.unlockReferral(dto, req.user.id,req.user.hospitalId);
  }

  // ────────────── SPECIALIST / NURSE / MIDWIFE FEEDBACK ──────────────
  @Patch(':id/complete')
  @Roles(UserRole.DOCTOR, UserRole.LIAISON_OFFICER, UserRole.NURSE, UserRole.MIDWIFE)
  async submitFeedback(
    @Param('id') id: string,
    @Body() dto: SubmitFeedbackDto, // Use the DTO directly
    @Req() req,
  ) {
    return this.referralsService.submitFeedback(id, dto.feedbackNote, req.user.id);
  }
  @Get('liaison/outbox')
  @Roles(UserRole.LIAISON_OFFICER, UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.HEALTH_CENTER_ADMIN, UserRole.NURSE, UserRole.MIDWIFE)
  async getLiaisonOutbox(@Req() req) {
    const hospitalId = req.user.hospitalId;
    if (!hospitalId) {
      throw new ForbiddenException('User is not assigned to a hospital');
    }
    return this.referralsService.getOutgoingReferrals(hospitalId);
  }

  @Get('specialist/queue')
  @Roles(UserRole.LIAISON_OFFICER, UserRole.DOCTOR, UserRole.NURSE, UserRole.MIDWIFE)
  async getSpecialistQueue(@Req() req) {
    /**
     * req.user is usually populated by your Passport JWT Strategy.
     * It should contain the user's hospitalId.
     */
    const hospitalId = req.user.hospitalId;
    
    if (!hospitalId) {
      throw new BadRequestException('User hospital information missing');
    }

    return await this.referralsService.getSpecialistQueue(hospitalId);
  }

  // ────────────── HOSPITAL DASHBOARD (must be declared before @Get(':id')) ──────────────

  @Get('dashboard/:type')
  async getDashboard(@Param('type') type: 'inbound' | 'outbound', @Req() req) {
    return this.referralsService.getHospitalDashboard(req.user.hospitalId, type);
  }

  @Get()
  async getReferrals(
    @Req() req,
    @Query('type') type: 'inbound' | 'outbound' = 'outbound',
  ) {
    const hospitalId = req.user.hospitalId;

    return this.referralsService.getHospitalDashboard(hospitalId, type);
  }

  @Get('admin/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.HOSPITAL_ADMIN)
  async getAdminStats(@Req() req) {
    const userRole = req.user.role;
    const userRegionId = req.user.regionId;
    
    if (userRole === UserRole.SYSTEM_ADMIN && userRegionId) {
      return this.referralsService.getSystemAdminReferralStats(userRegionId);
    }
    
    return this.referralsService.getAdminReferralStats();
  }

  @Get(':id')
  @Roles(UserRole.LIAISON_OFFICER, UserRole.DOCTOR, UserRole.NURSE, UserRole.MIDWIFE)
  async getOne(@Param('id') id: string, @Req() req) {
    return this.referralsService.getReferralById(id, req.user.hospitalId, req.user.role);
  }
}
