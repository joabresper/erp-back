import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { HashingService } from 'src/common/providers/hashing.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesService } from 'src/roles/roles.service';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaService>;
  let rolesService: DeepMockProxy<RolesService>;
  let hashingService: DeepMockProxy<HashingService>;

  const createUserDtoFactory = (overrides?: Partial<CreateUserDto>): CreateUserDto => ({
    email: 'test@example.com',
    fullName: 'John Doe',
    password: 'password123',
    roleId: 'uuid-role-123',
    ...overrides,
  });

  const mockRoleFactory = (
    overrides?: Partial<{
      id: string;
      name: string;
      description: string;
      level: number;
    }>,
  ) => ({
    id: 'uuid-role-123',
    name: 'ADMIN',
    description: 'Admin role',
    level: 10,
    ...overrides,
  });

  const hashedPassword =
    '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012';

  const mockUserFactory = (overrides?: Partial<User>): User => ({
    id: 'uuid-user-123',
    email: 'test@example.com',
    fullName: 'John Doe',
    password: hashedPassword,
    phone: null,
    address: null,
    roleId: 'uuid-role-123',
    deletedAt: null,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: RolesService,
          useValue: mockDeep<RolesService>(),
        },
        {
          provide: HashingService,
          useValue: mockDeep<HashingService>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
    rolesService = module.get(RolesService);
    hashingService = module.get(HashingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crea un usuario con rol especificado', async () => {
      const createUserDto = createUserDtoFactory();
      const role = mockRoleFactory({ id: createUserDto.roleId, level: 3 });
      const mockUser = mockUserFactory();
      const creatorLevel = 5;

      rolesService.findById.mockResolvedValue(role);
      hashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(creatorLevel, createUserDto);

      expect(result).toEqual(mockUser);
      expect(rolesService.findById).toHaveBeenCalledWith(createUserDto.roleId);
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: createUserDto.fullName,
          email: createUserDto.email,
          password: hashedPassword,
          role: {
            connect: { id: createUserDto.roleId },
          },
        },
        include: { role: true },
      });
      expect(rolesService.findByName).not.toHaveBeenCalled();
    });

    it('usa el rol por defecto cuando no se envía roleId', async () => {
      const createUserDto = createUserDtoFactory({ roleId: undefined });
      const defaultRole = mockRoleFactory({
        id: 'uuid-default-role',
        name: 'USER',
        level: 1,
      });
      const mockUser = mockUserFactory({ roleId: defaultRole.id });
      const creatorLevel = 3;

      rolesService.findByName.mockResolvedValue(defaultRole);
      rolesService.findById.mockResolvedValue(defaultRole);
      hashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(creatorLevel, createUserDto);

      expect(result).toEqual(mockUser);
      expect(rolesService.findByName).toHaveBeenCalledWith('USER');
      expect(rolesService.findById).toHaveBeenCalledWith(defaultRole.id);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: createUserDto.fullName,
          email: createUserDto.email,
          password: hashedPassword,
          role: {
            connect: { id: defaultRole.id },
          },
        },
        include: { role: true },
      });
    });

    it('lanza error si falta el rol por defecto', async () => {
      const createUserDto = createUserDtoFactory({ roleId: undefined });

      rolesService.findByName.mockResolvedValue(null as never);

      await expect(service.create(99, createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(rolesService.findByName).toHaveBeenCalledWith('USER');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('lanza error si el roleId enviado no existe', async () => {
      const createUserDto = createUserDtoFactory();

      rolesService.findById.mockResolvedValue(null as never);

      await expect(service.create(99, createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(rolesService.findById).toHaveBeenCalledWith(createUserDto.roleId);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si no tiene jerarquía suficiente', async () => {
      const createUserDto = createUserDtoFactory();
      const role = mockRoleFactory({ id: createUserDto.roleId, level: 5 });

      rolesService.findById.mockResolvedValue(role);

      await expect(service.create(5, createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashingService.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('propaga error si falla el hashing', async () => {
      const createUserDto = createUserDtoFactory();
      const role = mockRoleFactory({ id: createUserDto.roleId, level: 1 });
      const hashingError = new Error('hash failed');

      rolesService.findById.mockResolvedValue(role);
      hashingService.hash.mockRejectedValue(hashingError);

      await expect(service.create(10, createUserDto)).rejects.toThrow('hash failed');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retorna usuarios sin incluir rol cuando includeRole es false', async () => {
      const mockUsers = [mockUserFactory()];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(false);

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { role: false },
      });
    });

    it('incluye rol cuando includeRole es true', async () => {
      const mockUsers = [mockUserFactory()];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      await service.findAll(true);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { role: true },
      });
    });

    it('retorna lista vacía cuando no hay usuarios', async () => {
      const mockUsers: User[] = [];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(false);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('retorna usuario por id', async () => {
      const userId = 'uuid-user-123';
      const mockUser = mockUserFactory({ id: userId });

      prisma.user.findFirstOrThrow.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
      });
    });

  });

  describe('findByIdWithRole', () => {
    it('retorna usuario con rol incluido', async () => {
      const userId = 'uuid-user-123';
      const mockUserWithRole = {
        ...mockUserFactory({ id: userId }),
        role: mockRoleFactory(),
      };

      prisma.user.findFirstOrThrow.mockResolvedValue(mockUserWithRole as never);

      const result = await service.findByIdWithRole(userId);

      expect(result).toEqual(mockUserWithRole);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
        include: { role: true },
      });
    });
  });

  describe('findByEmail', () => {
    it('retorna usuario por email con rol incluido', async () => {
      const userEmail = 'Test@Example.com';
      const mockUserWithRole = {
        ...mockUserFactory({
        email: userEmail,
        }),
        role: mockRoleFactory(),
      };

      prisma.user.findFirstOrThrow.mockResolvedValue(mockUserWithRole as never);

      const result = await service.findByEmail(userEmail);

      expect(result).toEqual(mockUserWithRole);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          email: userEmail,
          deletedAt: null,
        },
        include: { role: true },
      });
    });
  });

  describe('update', () => {
    it('actualiza usuario por id', async () => {
      const userId = 'uuid-user-123';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      };
      const updatedUser = mockUserFactory({
        id: userId,
        fullName: updateUserDto.fullName,
        email: updateUserDto.email,
      });

      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: updateUserDto,
      });
    });

  });

  describe('remove', () => {
    it('realiza soft delete de usuario', async () => {
      const userId = 'uuid-user-123';
      const deletedUser = mockUserFactory({ id: userId, deletedAt: new Date() });

      prisma.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove(userId);

      expect(result).toEqual(deletedUser);
      expect(result.deletedAt).not.toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

  });

  describe('findAllDeleted', () => {
    it('retorna usuarios eliminados', async () => {
      const mockDeletedUsers = [
        mockUserFactory({ id: 'uuid-1', deletedAt: new Date('2024-01-01') }),
        mockUserFactory({ id: 'uuid-2', deletedAt: new Date('2024-01-02') }),
      ];

      prisma.user.findMany.mockResolvedValue(mockDeletedUsers);

      const result = await service.findAllDeleted();

      expect(result).toEqual(mockDeletedUsers);
      expect(result.every((user) => user.deletedAt !== null)).toBe(true);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: { not: null },
        },
      });
    });
  });

  describe('restore', () => {
    it('restaura usuario y lo asigna al rol por defecto', async () => {
      const userId = 'uuid-user-123';
      const defaultRole = mockRoleFactory({ id: 'uuid-role-default', name: 'USER' });
      const restoredUser = mockUserFactory({ id: userId, roleId: defaultRole.id });

      rolesService.findByName.mockResolvedValue(defaultRole);
      prisma.user.update.mockResolvedValue(restoredUser);

      const result = await service.restore(userId);

      expect(result).toEqual(restoredUser);
      expect(result.deletedAt).toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          deletedAt: null,
          role: {
            connect: { id: defaultRole.id },
          },
        },
      });
    });

    it('lanza error si falta rol por defecto al restaurar', async () => {
      rolesService.findByName.mockResolvedValue(null as never);

      await expect(service.restore('uuid-user-123')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('changeRole', () => {
    it('cambia rol cuando existe y hay permisos de jerarquía', async () => {
      const userId = 'uuid-user-123';
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };
      const targetRole = mockRoleFactory({ id: changeUserRoleDto.roleId, level: 2 });
      const updatedUser = {
        ...mockUserFactory({ id: userId, roleId: changeUserRoleDto.roleId }),
        role: targetRole,
      };

      rolesService.findById.mockResolvedValue(targetRole);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.changeRole(userId, 5, changeUserRoleDto);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          role: {
            connect: { id: changeUserRoleDto.roleId },
          },
        },
        include: { role: true },
      });
    });

    it('lanza NotFoundException cuando el rol no existe', async () => {
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };

      rolesService.findById.mockResolvedValue(null as never);

      await expect(
        service.changeRole('uuid-user-123', 10, changeUserRoleDto),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('lanza ForbiddenException cuando no tiene jerarquía para asignar rol', async () => {
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };
      const targetRole = mockRoleFactory({ id: changeUserRoleDto.roleId, level: 7 });

      rolesService.findById.mockResolvedValue(targetRole);

      await expect(
        service.changeRole('uuid-user-123', 7, changeUserRoleDto),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
