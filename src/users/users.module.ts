import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from 'src/roles/roles.module';
import { HashingService } from 'src/common/providers/hashing.service';

@Module({
  imports: [RolesModule],
  controllers: [UsersController],
  providers: [UsersService, HashingService],
  exports: [UsersService],
})
export class UsersModule {}
