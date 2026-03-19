import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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

  @Roles('MOH_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new woreda' })
  @ApiResponse({ status: 201, description: 'Woreda successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only MOH_ADMIN can create woredas' })
  async create(@Body() createWoredaDto: CreateWoredaDto) {
    return this.woredasService.create(createWoredaDto);
  }

  @Roles('MOH_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all woredas' })
  @ApiResponse({ status: 200, description: 'Woredas retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    return this.woredasService.findAllWithRoleFilter(user.role, user.woredaId?.toString());
  }
}
