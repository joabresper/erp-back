import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(
    private prismaService: PrismaService
  ) {}

  async create(creatorLevel: number, createRoleDto: CreateRoleDto): Promise<Role> {

    if (!createRoleDto.level) {
      createRoleDto.level = 1;
    }

    if (creatorLevel <= createRoleDto.level) {
      throw new UnauthorizedException('You do not have permission to create a role with this level.');
    }

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
