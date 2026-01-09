import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
  
    const restrictedRoles = ['ADMIN', 'MANAGER'];

    if (createUserDto.role && restrictedRoles.includes(createUserDto.role.toUpperCase())) {
      throw new ForbiddenException('You cannot create this role from this endpoint.');
    }

    return this.usersService.create(createUserDto);
  }

  @Post()
  createAdmin(@Body() createUserDto: CreateUserDto) {
    createUserDto.role = 'ADMIN';
    return this.usersService.create(createUserDto); 
  }

  @Post()
  createManager(@Body() createUserDto: CreateUserDto) {
    createUserDto.role = 'MANAGER';
    return this.usersService.create(createUserDto); 
  }

  @Get()
  findAll(@Query('email') email?: string) {
    if (email) {
      return this.usersService.findByEmail(email);
    }
    return this.usersService.findAll();
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
