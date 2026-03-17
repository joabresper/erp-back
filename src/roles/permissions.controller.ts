import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // @Post()
  // create(@Body() createPermissionDto: CreatePermissionDto) {
  //   return this.permissionsService.create(createPermissionDto);
  // }

  @Get()
  @RequirePermissions('PERMISSION:VIEW')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully.',
  })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('PERMISSION:VIEW')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findById(id);
  }

  // @Patch(':id')
  // update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
  //   return this.permissionsService.update(id, updatePermissionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.permissionsService.remove(id);
  // }
}
