import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Hospitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Roles('SYSTEM_ADMIN', 'WOREDA_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new hospital' })
  @ApiResponse({ status: 201, description: 'Hospital successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only SUPER_ADMIN and WOREDA_ADMIN can create hospitals' })
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalsService.create(createHospitalDto);
  }

  @Roles('SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN', 'MOH_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'LIAISON_OFFICER')
  @Get()
  @ApiOperation({ summary: 'Get all hospitals' })
  @ApiResponse({ status: 200, description: 'Hospitals retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    return this.hospitalsService.findAllWithRoleFilter(user.role, user.hospitalId?.toString(), user.regionId?.toString());
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a hospital' })
  @ApiResponse({ status: 200, description: 'Hospital updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() updateHospitalDto: any) {
    return this.hospitalsService.update(id, updateHospitalDto);
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hospital' })
  @ApiResponse({ status: 200, description: 'Hospital deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.hospitalsService.remove(id);
  }
}
