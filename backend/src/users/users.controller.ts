import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSelfDto } from './dto/update-self.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN','HEALTH_CENTER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    console.log('DEBUG Controller - Create user request received');
    console.log('DEBUG Controller - Request user:', req.user);
    console.log('DEBUG Controller - User role:', req.user?.role);
    
    const user = req.user;
    
    if (user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN') {
      console.log(`DEBUG Controller - Creating user as ${user.role}`);
      return this.usersService.create(createUserDto);
    }

    if (creator.role === 'HOSPITAL_ADMIN' || creator.role === 'HEALTH_CENTER_ADMIN') {
      // Force hospital to creator's own hospital — frontend cannot override this
      return this.usersService.createWithRoleValidation(
        createUserDto,
        creator.role,
        creator.hospitalId?.toString(),
        creator.woredaId?.toString(),
      );
    }

    if (creator.role === 'SYSTEM_ADMIN') {
      // System admin can only create users within their assigned region
      // Inject assignedRegion from the creator so it cannot be spoofed
      const dto = {
        ...createUserDto,
        assignedRegion: creator.assignedRegion ?? createUserDto.assignedRegion,
      };
      return this.usersService.create(dto);
    }

    if (creator.role === 'WOREDA_ADMIN') {
      // Woreda admin cannot create users (existing rule)
      throw new ForbiddenException('Woreda Admin cannot create users');
    }

    throw new ForbiddenException('Insufficient permissions to create users');
  }

  // ─── Self-profile endpoints (any authenticated user) ───────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req) {
    // The JWT strategy spreads the full Mongoose user object into req.user,
    // so _id is a Mongoose ObjectId. userId is also set as the raw sub string.
    const id = req.user._id?.toString() ?? req.user.userId ?? req.user.sub;
    return this.usersService.getOwnProfile(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile (name, email, phone, password)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (e.g. wrong current password)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(@Request() req, @Body() body: UpdateSelfDto) {
    const id = req.user._id?.toString() ?? req.user.userId ?? req.user.sub;
    return this.usersService.updateSelf(id, body);
  }

  // ─── Admin endpoints ─────────────────────────────────────────────────────────

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    return this.usersService.findAllWithRoleFilter(user.role, user.hospitalId?.toString());
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN')
  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', description: 'User role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByRole(@Param('role') role: string, @Request() req) {
    const user = req.user;
    return this.usersService.findByRoleWithFilter(role, user.role, user.hospitalId?.toString());
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access this user' })
  async findById(@Param('id') id: string, @Request() req) {
    // 'me' is handled by GET /users/me — should never reach here
    if (id === 'me') {
      return this.usersService.findByIdWithRoleFilter(req.user.sub, 'SUPER_ADMIN');
    }
    const user = req.user;
    return this.usersService.findByIdWithRoleFilter(id, user.role, user.hospitalId?.toString());
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const user = req.user;
    
    if (user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN') {
      return this.usersService.update(id, updateUserDto);
    } else if (user.role === 'HOSPITAL_ADMIN') {
      return this.usersService.updateWithRoleValidation(
        id,
        updateUserDto, 
        user.role, 
        user.hospitalId?.toString()
      );
    }
  }

  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string, @Request() req) {
    const user = req.user;
    
    if (user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN') {
      return this.usersService.delete(id);
    } else if (user.role === 'HOSPITAL_ADMIN') {
      return this.usersService.deleteWithRoleValidation(
        id,
        user.role, 
        user.hospitalId?.toString()
      );
    }
  }
}

