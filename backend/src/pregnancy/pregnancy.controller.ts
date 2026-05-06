import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PregnancyService } from './pregnancy.service';
import { PregnancyReminderService } from './pregnancy-reminder.service';
import { AncScheduleService } from './anc-schedule.service';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Pregnancy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pregnancy')
export class PregnancyController {
  constructor(
    private readonly pregnancyService: PregnancyService,
    private readonly pregnancyReminderService: PregnancyReminderService,
    private readonly ancScheduleService: AncScheduleService,
  ) {}

  // ── Manual trigger (dev/testing) ─────────────────────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  @Post('reminders/trigger')
  @ApiOperation({ summary: 'Manually trigger all ANC jobs (reminders + missed detection)' })
  @ApiResponse({ status: 200, description: 'Jobs triggered' })
  async triggerReminders() {
    return this.ancScheduleService.triggerManually();
  }

  // ── Complete a visit ──────────────────────────────────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a visit as completed' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({ status: 200, description: 'Visit marked as completed' })
  async completeVisit(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.pregnancyService.completeVisit(
      id, user.role, user.hospitalId?.toString(), user._id?.toString(),
    );
  }

  // ── Reschedule a visit (manual override) ─────────────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a visit (requires overrideReason)' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({ status: 200, description: 'Visit rescheduled' })
  @ApiResponse({ status: 400, description: 'overrideReason required or duplicate date' })
  async rescheduleVisit(
    @Param('id') id: string,
    @Body() body: { newDate: string; overrideReason: string },
    @Request() req,
  ) {
    const user = req.user;
    if (!body.newDate || !body.overrideReason) {
      throw new Error('newDate and overrideReason are required');
    }
    return this.pregnancyService.rescheduleVisit(
      id,
      new Date(body.newDate),
      body.overrideReason,
      user.role,
      user.hospitalId?.toString(),
      user._id?.toString(),
    );
  }

  // ── Create manual visit ───────────────────────────────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Post('manual')
  @ApiOperation({ summary: 'Create a manual visit (ANC, PNC, Emergency, Custom) with override reason' })
  @ApiResponse({ status: 201, description: 'Manual visit created' })
  @ApiResponse({ status: 400, description: 'Validation error (duplicate, missing reason, past date without flag)' })
  async createManualVisit(@Body() body: any, @Request() req) {
    const user = req.user;
    return this.pregnancyService.createManualVisit(
      {
        ...body,
        visitDate: new Date(body.visitDate),
      },
      user.role,
      user.hospitalId?.toString(),
      user._id?.toString(),
    );
  }

  // ── Full schedule (visits + vaccines + warnings) ──────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('full-schedule/:motherId')
  @ApiOperation({ summary: 'Get full schedule for a mother: all visits, vaccines, next visit, overdue, warnings' })
  @ApiParam({ name: 'motherId', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Full schedule retrieved' })
  async getFullSchedule(@Param('motherId') motherId: string) {
    return this.pregnancyService.getFullSchedule(motherId);
  }

  // ── ANC schedule for a mother ─────────────────────────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('anc-schedule/:motherId')
  @ApiOperation({ summary: 'Get full WHO ANC schedule for a mother (all 8 visits with status)' })
  @ApiParam({ name: 'motherId', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'ANC schedule retrieved' })
  async getAncSchedule(@Param('motherId') motherId: string) {
    return this.ancScheduleService.getAncSchedule(motherId);
  }

  // ── Maternal vaccines ─────────────────────────────────────────────────────────
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Post('maternal-vaccines')
  @ApiOperation({ summary: 'Record a maternal vaccine dose (TT, Influenza, etc.)' })
  @ApiResponse({ status: 201, description: 'Vaccine recorded' })
  async recordMaternalVaccine(@Body() body: any, @Request() req) {
    const user = req.user;
    return this.ancScheduleService.recordMaternalVaccine({
      ...body,
      givenBy: user._id?.toString(),
      givenAt: user.hospitalId?.toString(),
      givenDate: body.givenDate ? new Date(body.givenDate) : new Date(),
    });
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('maternal-vaccines/:motherId')
  @ApiOperation({ summary: 'Get maternal vaccine history for a mother' })
  @ApiParam({ name: 'motherId', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Vaccine history retrieved' })
  async getMaternalVaccineHistory(@Param('motherId') motherId: string) {
    return this.ancScheduleService.getMaternalVaccineHistory(motherId);
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Post()
  @ApiOperation({ summary: 'Create pregnancy visit record' })
  @ApiResponse({ status: 201, description: 'Pregnancy record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createPregnancyDto: CreatePregnancyDto, @Request() req) {
    const user = req.user;
    return this.pregnancyService.create(
      createPregnancyDto,
      user.role,
      user.hospitalId?.toString(),
      user._id.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get()
  @ApiOperation({ summary: 'Get all pregnancy records' })
  @ApiResponse({ status: 200, description: 'Pregnancy records retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    return this.pregnancyService.findAll(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('mother/:motherId')
  @ApiOperation({ summary: 'Get pregnancy records for a specific mother' })
  @ApiParam({ name: 'motherId', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Pregnancy records retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mother not found' })
  async findByMotherId(@Param('motherId') motherId: string, @Request() req) {
    console.log('=== PREGNANCY BY MOTHER DEBUG ===');
    console.log('MotherId:', motherId);
    const user = req.user;
    console.log('User:', user);
    console.log('User role:', user.role);
    console.log('User hospitalId:', user.hospitalId);
    
    const result = await this.pregnancyService.findByMotherId(
      motherId,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
    
    console.log('Pregnancy records found:', result.length);
    console.log('=== END PREGNANCY BY MOTHER DEBUG ===');
    
    return result;
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('stats')
  @ApiOperation({ summary: 'Get pregnancy statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    const user = req.user;
    return this.pregnancyService.getPregnancyStats(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('high-risk')
  @ApiOperation({ summary: 'Get high risk pregnancies' })
  @ApiResponse({ status: 200, description: 'High risk pregnancies retrieved successfully' })
  async getHighRisk(@Request() req) {
    const user = req.user;
    return this.pregnancyService.getHighRiskPregnancies(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('upcoming-visits')
  @ApiOperation({ summary: 'Get upcoming visits (next 7 days)' })
  @ApiResponse({ status: 200, description: 'Upcoming visits retrieved successfully' })
  async getUpcomingVisits(@Request() req) {
    const user = req.user;
    return this.pregnancyService.getUpcomingVisits(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get(':id')
  @ApiOperation({ summary: 'Get pregnancy record by ID' })
  @ApiParam({ name: 'id', description: 'Pregnancy record ID' })
  @ApiResponse({ status: 200, description: 'Pregnancy record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pregnancy record not found' })
  async findById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.pregnancyService.findById(
      id,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch(':id')
  @ApiOperation({ summary: 'Update pregnancy record' })
  @ApiParam({ name: 'id', description: 'Pregnancy record ID' })
  @ApiResponse({ status: 200, description: 'Pregnancy record updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Pregnancy record not found' })
  async update(@Param('id') id: string, @Body() updatePregnancyDto: any, @Request() req) {
    const user = req.user;
    return this.pregnancyService.update(
      id,
      updatePregnancyDto,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete pregnancy record' })
  @ApiParam({ name: 'id', description: 'Pregnancy record ID' })
  @ApiResponse({ status: 200, description: 'Pregnancy record deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Pregnancy record not found' })
  async delete(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.pregnancyService.delete(
      id,
      user.role,
      user.hospitalId?.toString()
    );
  }
}
