import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ForbiddenException, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckHierarchy } from 'src/common/decorators/check-hierarchy.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('USER:CREATE')
  @CheckHierarchy('user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to create a user with the specified role.' })
  createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(req.user.level, createUserDto);
  }

  @Get()
  @RequirePermissions('USER:VIEW')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
  findAll(@Query('includeRole') includeRole: string) {
    const includeRoleFlag = includeRole === 'true';
    return this.usersService.findAll(includeRoleFlag);
  }
  
  @Get('deleted')
  @RequirePermissions('USER:VIEW_DELETED')
  @ApiOperation({ summary: 'Get all deleted users' })
  @ApiResponse({ status: 200, description: 'List of deleted users retrieved successfully.' })
  findAllDeleted() {
    return this.usersService.findAllDeleted();
  }

  @Get(':id')
  @RequirePermissions('USER:VIEW')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'The user has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string,) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('USER:UPDATE')
  @CheckHierarchy('user')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @RequirePermissions('USER:UPDATE_ROLE')
  @CheckHierarchy('user')
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({ status: 200, description: 'The user role has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to assign the specified role.' })
  changeRole(@Param('id', ParseUUIDPipe) id: string, @Req() req: any, @Body() changeUserRoleDto: ChangeUserRoleDto) {
    return this.usersService.changeRole(id, req.user.level, changeUserRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('USER:DELETE')
  @CheckHierarchy('user')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/restore')
  @RequirePermissions('USER:RESTORE')
  @ApiOperation({ summary: 'Restore a deleted user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully restored.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }
}
