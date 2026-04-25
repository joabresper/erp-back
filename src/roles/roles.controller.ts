import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionsDto } from './dto/update-role.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckHierarchy } from 'src/common/decorators/check-hierarchy.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constant';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ROLE_CREATE)
  @CheckHierarchy('role')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to create a role with the specified level.',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ROLE_VIEW)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully.',
  })
  findAll(@Query('includePermissions') includePermissions?: string) {
    const includePerms = includePermissions === 'true';
    return this.rolesService.findAll(includePerms);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ROLE_VIEW)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includePermissions') includePermissions?: string,
  ) {
    const includePerms = includePermissions === 'true';
    return this.rolesService.findById(id, includePerms);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLE_UPDATE)
  @CheckHierarchy('role')
  @ApiOperation({ summary: 'Update role information' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to update a role to the specified level.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ROLE_DELETE)
  @CheckHierarchy('role')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You do not have permission to delete this role.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }

  @Patch(':id/permissions')
  @RequirePermissions(PERMISSIONS.ROLE_UPDATE_PERMISSIONS)
  @CheckHierarchy('role')
  @ApiOperation({ summary: 'Update role permissions' })
  @ApiResponse({
    status: 200,
    description: 'The role permissions have been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissions(
      id,
      updateRolePermissionsDto.permissionIds,
    );
  }
}
