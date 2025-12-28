import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(
    private prismaService: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.prismaService.role.create({
      data: createRoleDto,
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.prismaService.role.findMany();
  }

  async findByName(name: string): Promise<Role> {
    return await this.prismaService.role.findUniqueOrThrow({
      where: { name },
    });
  }

  async findById(id: string): Promise<Role> {
    return await this.prismaService.role.findUniqueOrThrow({
      where: { id },
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
  async addPermission(roleId: string, permissionId: string) {
    return await this.prismaService.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: { id: permissionId }
        }
      },
      include: { permissions: true },
    })
  }

  async removePermission(roleId: string, permissionId: string) {
    return await this.prismaService.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: { id: permissionId }
        }
      },
      include: { permissions: true },
    })
  }

  async updatePermissions(roleId: string, permissionIds: string[]) {
    return this.prismaService.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: [],
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }
}
