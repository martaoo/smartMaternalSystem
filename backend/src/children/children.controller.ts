import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { CreateGrowthRecordDto } from './dto/create-growth-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Children')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Post()
  @ApiOperation({ summary: 'Register a new child' })
  @ApiResponse({ status: 201, description: 'Child successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createChildDto: CreateChildDto, @Request() req) {
    const user = req.user;
    return this.childrenService.create(
      createChildDto,
      user.role,
      user.hospitalId?.toString(),
      user._id.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get()
  @ApiOperation({ summary: 'Get all children' })
  @ApiResponse({ status: 200, description: 'Children retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    return this.childrenService.findAll(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('search')
  @ApiOperation({ summary: 'Search children by name or mother information' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Children found' })
  async search(@Query('q') query: string, @Request() req) {
    const user = req.user;
    return this.childrenService.search(
      query,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('stats')
  @ApiOperation({ summary: 'Get children statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    const user = req.user;
    return this.childrenService.getChildrenStats(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('follow-up-needed')
  @ApiOperation({ summary: 'Get children needing follow-up' })
  @ApiResponse({ status: 200, description: 'Children needing follow-up retrieved successfully' })
  async getFollowUpNeeded(@Request() req) {
    const user = req.user;
    return this.childrenService.getChildrenNeedingFollowUp(
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get('mother/:motherId')
  @ApiOperation({ summary: 'Get children for a specific mother' })
  @ApiParam({ name: 'motherId', description: 'Mother ID' })
  @ApiResponse({ status: 200, description: 'Children retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mother not found' })
  async findByMotherId(@Param('motherId') motherId: string, @Request() req) {
    const user = req.user;
    return this.childrenService.findByMotherId(
      motherId,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get(':id')
  @ApiOperation({ summary: 'Get child by ID' })
  @ApiParam({ name: 'id', description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Child retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access this child' })
  async findById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.childrenService.findById(
      id,
      user.role,
      user.hospitalId?.toString(),
      user.woredaId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch(':id')
  @ApiOperation({ summary: 'Update child information' })
  @ApiParam({ name: 'id', description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Child successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async update(@Param('id') id: string, @Body() updateChildDto: any, @Request() req) {
    const user = req.user;
    return this.childrenService.update(
      id,
      updateChildDto,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete child record' })
  @ApiParam({ name: 'id', description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Child successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async delete(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.childrenService.delete(
      id,
      user.role,
      user.hospitalId?.toString()
    );
  }

  // Growth Record Endpoints
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Post(':childId/growth-records')
  @ApiOperation({ summary: 'Add growth record for a child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({ status: 201, description: 'Growth record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async createGrowthRecord(@Param('childId') childId: string, @Body() createGrowthRecordDto: CreateGrowthRecordDto, @Request() req) {
    const user = req.user;
    // Override childId from URL parameter
    createGrowthRecordDto.childId = childId;
    
    return this.childrenService.createGrowthRecord(
      createGrowthRecordDto,
      user.role,
      user.hospitalId?.toString(),
      user._id.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get(':childId/growth-records')
  @ApiOperation({ summary: 'Get growth records for a child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Growth records retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async getGrowthRecords(@Param('childId') childId: string, @Request() req) {
    const user = req.user;
    return this.childrenService.getGrowthRecordsByChildId(
      childId,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Get(':childId/growth-records/latest')
  @ApiOperation({ summary: 'Get latest growth record for a child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Latest growth record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Child or growth record not found' })
  async getLatestGrowthRecord(@Param('childId') childId: string, @Request() req) {
    const user = req.user;
    return this.childrenService.getLatestGrowthRecord(
      childId,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Patch('growth-records/:id')
  @ApiOperation({ summary: 'Update growth record' })
  @ApiParam({ name: 'id', description: 'Growth record ID' })
  @ApiResponse({ status: 200, description: 'Growth record updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Growth record not found' })
  async updateGrowthRecord(@Param('id') id: string, @Body() updateGrowthRecordDto: any, @Request() req) {
    const user = req.user;
    return this.childrenService.updateGrowthRecord(
      id,
      updateGrowthRecordDto,
      user.role,
      user.hospitalId?.toString()
    );
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE')
  @Delete('growth-records/:id')
  @ApiOperation({ summary: 'Delete growth record' })
  @ApiParam({ name: 'id', description: 'Growth record ID' })
  @ApiResponse({ status: 200, description: 'Growth record deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Growth record not found' })
  async deleteGrowthRecord(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.childrenService.deleteGrowthRecord(
      id,
      user.role,
      user.hospitalId?.toString()
    );
  }
}
