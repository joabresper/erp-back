import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ForbiddenException, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('CREATE_USER')
  createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(req.user.level, createUserDto);
  }

  @Get()
  @RequirePermissions('VIEW_USERS')
  findAll(@Query('includeRole') includeRole: string) {
    const includeRoleFlag = includeRole === 'true';
    return this.usersService.findAll(includeRoleFlag);
  }

  @Get(':id')
  @RequirePermissions('VIEW_USERS')
  findOne(@Param('id', ParseUUIDPipe) id: string,) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('UPDATE_USERS')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @RequirePermissions('USER:UPDATE_ROLE')
  changeRole(@Param('id', ParseUUIDPipe) id: string, @Req() req: any, @Body() changeUserRoleDto: ChangeUserRoleDto) {
    return this.usersService.changeRole(id, req.user.level, changeUserRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('DELETE_USER')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
