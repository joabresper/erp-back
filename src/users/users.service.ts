import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { User } from '@prisma/client';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from 'src/common/providers/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private rolesService: RolesService,
    private hashingService: HashingService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;
    let roleId = createUserDto.roleId;


    if (!roleId) {
      const defaultRole = await this.rolesService.findByName('USER');
      
      if (!defaultRole) {
        throw new InternalServerErrorException('The system is not configured correctly (Missing default role).');
      }
      roleId = defaultRole.id;
    }

    // TODO: agregar hasheo de la password
    const hashedPassword = await this.hashingService.hash(password);

    return await this.prismaService.user.create({
      data: {
        fullName: userData.fullName,
        password: hashedPassword,
        email: userData.email,
        role: {
          connect: { id: roleId }
        }
      },
      include: { role: true }
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany({
      where: { deletedAt: null }
    });
  }

  async findById(id: string): Promise<User> {
    return await this.prismaService.user.findFirstOrThrow({
      where: {
        id,
        deletedAt: null
      },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.prismaService.user.findFirstOrThrow({
      where: {
        email,
        deletedAt: null
      },
    })
  }

  // TODO: la modificacion del email se realiza en otro metodo con toras verificaciones
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id,
        deletedAt: null
      },
      data: updateUserDto
    });
  }

  // Logic delete
  async remove(id: string) {
    return await this.prismaService.user.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        deletedAt: new Date(),
      }
    });
  }

  async findAllDeleted(): Promise<User[]> {
    return await this.prismaService.user.findMany({
      where: {
        deletedAt: { not: null }
      }
    })
  }

  async restore(id: string) {
    return await this.prismaService.user.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  async changeRole(id: string, changeUserRolDto: ChangeUserRoleDto) {
    return await this.prismaService.user.update({
      where: { id },
      data: {
        role: {
          connect: { id: changeUserRolDto.roleId }
        }
      },
      include: { role: true }
    });
  }
}
