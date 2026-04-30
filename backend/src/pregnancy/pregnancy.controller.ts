import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PregnancyService } from './pregnancy.service';
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
  constructor(private readonly pregnancyService: PregnancyService) {}

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
