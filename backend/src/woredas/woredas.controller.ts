import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { WoredasService } from './woredas.service';
import { CreateWoredaDto } from './dto/create-woreda.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Woredas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('woredas')
export class WoredasController {
  constructor(private readonly woredasService: WoredasService) {}

  @Roles('SYSTEM_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new woreda' })
  @ApiResponse({ status: 201, description: 'Woreda successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only SUPER_ADMIN can create woredas' })
  async create(@Body() createWoredaDto: CreateWoredaDto) {
    return this.woredasService.create(createWoredaDto);
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN', 'MOH_ADMIN', 'DOCTOR')
  @Get()
  @ApiOperation({ summary: 'Get all woredas' })
  @ApiResponse({ status: 200, description: 'Woredas retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    // Check if user has woredaId property, if not, return all
    const woredaId = user.woredaId?.toString() || user.woredaId;
    return this.woredasService.findAllWithRoleFilter(user.role, woredaId, user.regionId?.toString());
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a woreda' })
  @ApiResponse({ status: 200, description: 'Woreda updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() updateWoredaDto: any) {
    return this.woredasService.update(id, updateWoredaDto);
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a woreda' })
  @ApiResponse({ status: 200, description: 'Woreda deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.woredasService.remove(id);
  }
}
