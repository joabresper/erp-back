import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleWithPermissionsEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(private prismaService: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.prismaService.role.create({
      data: createRoleDto,
    });
  }

  async findAll(includePermissions: boolean = false): Promise<Role[]> {
    return await this.prismaService.role.findMany({
      include: {
        permissions: includePermissions,
      },
    });
  }

  async findByName(
    name: string,
    includePermissions: boolean,
  ): Promise<RoleWithPermissionsEntity>;
  async findByName(name: string): Promise<Role>;
  async findByName(
    name: string,
    includePermissions: boolean = true,
  ): Promise<Role | RoleWithPermissionsEntity> {
    return await this.prismaService.role.findUniqueOrThrow({
      where: { name },
      include: {
        permissions: includePermissions,
      },
    });
  }
  async findById(
    id: string,
    includePermissions: boolean,
  ): Promise<RoleWithPermissionsEntity>;
  async findById(id: string): Promise<Role>;
  async findById(
    id: string,
    includePermissions: boolean = false,
  ): Promise<Role | RoleWithPermissionsEntity> {
    return await this.prismaService.role.findUniqueOrThrow({
      where: { id },
      include: {
        permissions: includePermissions,
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return await this.prismaService.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string) {
    return await this.prismaService.role.delete({
      where: { id },
    });
  }

  // Permissions methods
  async updatePermissions(roleId: string, permissionIds: string[]) {
    return this.prismaService.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }
}
