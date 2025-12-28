import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prismaService: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return await this.prismaService.permission.create({
      data: createPermissionDto,
    });
  }

  async findAll(): Promise<Permission[]> {
    return await this.prismaService.permission.findMany();
  }

  async findByName(name: string): Promise<Permission> {
    return await this.prismaService.permission.findUniqueOrThrow({
      where: { name },
    });
  }

  async findById(id: string): Promise<Permission> {
    return await this.prismaService.permission.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    return await this.prismaService.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string) {
    return await this.prismaService.permission.delete({
      where: { id },
    });
  }
}

