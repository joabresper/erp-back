import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateRolePermissionsDto {
  @IsArray({ message: 'permissionIds must be an array of strings' })
  @IsUUID('4', {
    each: true,
    message: 'Each permissionId must be a valid UUID',
  })
  permissionIds: string[];
}
