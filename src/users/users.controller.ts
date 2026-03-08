import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ForbiddenException, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(req.user.level, createUserDto);
  }

  @Get()
  findAll(@Query('includeRole') includeRole: string) {
    const includeRoleFlag = includeRole === 'true';
    return this.usersService.findAll(includeRoleFlag);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string,) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id')
  changeRol(@Param('id', ParseUUIDPipe) id: string, @Body() changeUserRolDto: ChangeUserRoleDto) {
    return this.usersService.changeRole(id, changeUserRolDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
