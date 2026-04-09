import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WoredasService } from './woredas.service';
import { CreateWoredaDto } from './dto/create-woreda.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Woredas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('woredas')
export class WoredasController {
  constructor(private readonly woredasService: WoredasService) {}

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new woreda' })
  @ApiResponse({ status: 201, description: 'Woreda successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only SUPER_ADMIN or SYSTEM_ADMIN can create woredas' })
  async create(@Body() createWoredaDto: CreateWoredaDto, @Request() req) {
    const currentUser = req.user;
    
    // Validate that SYSTEM_ADMIN can only create woredas in their assigned region
    if (currentUser.role === 'SYSTEM_ADMIN') {
      if (createWoredaDto.region !== currentUser.assignedRegion) {
        throw new ForbiddenException('System Admin can only create woredas in their assigned region');
      }
    }
    
    return this.woredasService.create(createWoredaDto);
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all woredas (filtered by role and region)' })
  @ApiResponse({ status: 200, description: 'Woredas retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const currentUser = req.user;
    return this.woredasService.findAllWithRoleFilter(currentUser);
  }
}
