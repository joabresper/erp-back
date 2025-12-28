import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService],
})
export class RolesModule {}
