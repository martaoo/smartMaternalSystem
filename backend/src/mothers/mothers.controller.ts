import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MothersService } from './mothers.service';
import { CreateMotherDto } from './dto/create-mother.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Mothers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mothers')
export class MothersController {
  constructor(private readonly mothersService: MothersService) {}

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER')
  @Post()
  @ApiOperation({ summary: 'Register a new mother' })
  @ApiResponse({ status: 201, description: 'Mother successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createMotherDto: CreateMotherDto, @Request() req) {
    const user = req.user;
    return this.mothersService.create(
      createMotherDto,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER')
  @Get()
  @ApiOperation({ summary: 'Get all mothers' })
  @ApiResponse({ status: 200, description: 'Mothers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    return this.mothersService.findAll(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER')
  @Get('search')
  @ApiOperation({ summary: 'Search mothers by name, phone, or address' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Mothers found' })
  async search(@Query('q') query: string, @Request() req) {
    const user = req.user;
    return this.mothersService.search(
      query,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER')
  @Get('health-worker/:healthWorkerId')
  @ApiOperation({ summary: 'Get mothers assigned to a specific health worker' })
  @ApiParam({ name: 'healthWorkerId', description: 'Health worker ID' })
  @ApiResponse({ status: 200, description: 'Mothers retrieved successfully' })
  async getMothersByHealthWorker(@Param('healthWorkerId') healthWorkerId: string, @Request() req) {
    const user = req.user;
    return this.mothersService.getMothersByHealthWorker(
      healthWorkerId,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER')
  @Get(':id')
  @ApiOperation({ summary: 'Get mother by ID' })
  @ApiParam({ name: 'id', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Mother retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mother not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access this mother' })
  async findById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.mothersService.findById(
      id,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('MOTHER', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get(':id/td-schedule')
  @ApiOperation({ summary: 'Get maternal TD vaccination schedule (TD1-TD5)' })
  @ApiParam({ name: 'id', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'TD schedule retrieved successfully' })
  async getTdSchedule(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.mothersService.getTdSchedule(
      id,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString(),
    );
  }

  @Roles('MOTHER', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch(':id/td-schedule')
  @ApiOperation({ summary: 'Update one maternal TD dose date (TD1-TD5)' })
  @ApiParam({ name: 'id', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'TD schedule updated successfully' })
  async updateTdSchedule(
    @Param('id') id: string,
    @Body() body: { doseKey: 'TD1' | 'TD2' | 'TD3' | 'TD4' | 'TD5'; dateGiven: string },
    @Request() req,
  ) {
    const user = req.user;
    return this.mothersService.setTdDoseDate(
      id,
      body.doseKey,
      body.dateGiven,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString(),
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch(':id')
  @ApiOperation({ summary: 'Update mother information' })
  @ApiParam({ name: 'id', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Mother successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Mother not found' })
  async update(@Param('id') id: string, @Body() updateMotherDto: any, @Request() req) {
    const user = req.user;
    return this.mothersService.update(
      id,
      updateMotherDto,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete mother record' })
  @ApiParam({ name: 'id', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Mother successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Mother not found' })
  async delete(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.mothersService.delete(
      id,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('MOTHER')
  @Get('me/profile')
  @ApiOperation({ summary: 'Get mother profile for logged-in mother (mobile app)' })
  @ApiResponse({ status: 200, description: 'Mother profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mother profile not found' })
  async getMyProfile(@Request() req) {
    const mother = await this.mothersService.findMotherForAuthenticatedAppUser(req.user);
    if (!mother) {
      return { message: 'Mother profile not found', data: null };
    }
    return { message: 'Mother profile retrieved successfully', data: mother };
  }

  @Roles('MOTHER')
  @Get('me/td-schedule')
  @ApiOperation({ summary: 'Get maternal TD vaccination schedule for logged-in mother' })
  @ApiResponse({ status: 200, description: 'TD schedule retrieved successfully' })
  async getMyTdSchedule(@Request() req) {
    const mother = await this.mothersService.findMotherForAuthenticatedAppUser(req.user);
    if (!mother) {
      return { message: 'Mother profile not found', data: null };
    }
    const schedule = await this.mothersService.getTdSchedule(
      (mother as any)._id.toString(),
      req.user.role,
      req.user.hospitalId?.toString(),
      req.user.woredaId?.toString(),
    );
    return { message: 'TD schedule retrieved successfully', data: schedule };
  }

  @Roles('MOTHER')
  @Patch('me/td-schedule')
  @ApiOperation({ summary: 'Update one TD dose date for logged-in mother' })
  @ApiResponse({ status: 200, description: 'TD schedule updated successfully' })
  async updateMyTdSchedule(
    @Body() body: { doseKey: 'TD1' | 'TD2' | 'TD3' | 'TD4' | 'TD5'; dateGiven: string },
    @Request() req,
  ) {
    const mother = await this.mothersService.findMotherForAuthenticatedAppUser(req.user);
    if (!mother) {
      return { message: 'Mother profile not found', data: null };
    }
    const schedule = await this.mothersService.setTdDoseDate(
      (mother as any)._id.toString(),
      body.doseKey,
      body.dateGiven,
      req.user.role,
      req.user.hospitalId?.toString(),
      req.user.woredaId?.toString(),
    );
    return { message: 'TD schedule updated successfully', data: schedule };
  }

  @Roles('MOTHER')
  @Get('me/summary')
  @ApiOperation({ summary: 'Get mother dashboard summary with latest pregnancy info (mobile app)' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mother profile not found' })
  async getMySummary(@Request() req) {
    const mother = await this.mothersService.findMotherForAuthenticatedAppUser(req.user);
    if (!mother) {
      return { message: 'Mother profile not found', data: null };
    }
    
    // Get latest pregnancy record
    const latestPregnancy = await this.mothersService.getLatestPregnancy((mother as any)._id.toString());
    
    return {
      message: 'Dashboard summary retrieved successfully',
      data: {
        mother: mother,
        latestPregnancy: latestPregnancy
      }
    };
  }
}
