import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionsDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    return this.rolesService.create(req.user.level, createRoleDto);
  }

  @Get()
  findAll(@Query('includePermissions') includePermissions?: string) {
    const includePerms = includePermissions === 'true';
    return this.rolesService.findAll(includePerms);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
  
  @Patch(':id/permissions')
  updatePermissions(@Param('id') id: string, @Body() updateRolePermissionsDto: UpdateRolePermissionsDto) {
    return this.rolesService.updatePermissions(id, updateRolePermissionsDto.permissionIds);
  }
}
