import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { User } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { type RequestWithUser } from 'src/auth/entities/req.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: DeepMockProxy<UsersService>;

  // Factories para fixtures
  const createUserDtoFactory = (
    overrides?: Partial<CreateUserDto>,
  ): CreateUserDto => ({
    email: 'test@example.com',
    fullName: 'John Doe',
    password: 'password123',
    roleId: 'uuid-role-123',
    ...overrides,
  });

  const mockRoleFactory = (
    overrides?: Partial<{ id: string; name: string; description: string }>,
  ) => ({
    id: 'uuid-role-123',
    name: 'ADMIN',
    description: 'Admin role',
    ...overrides,
  });

  const mockUserFactory = (
    overrides?: Partial<User & { role: ReturnType<typeof mockRoleFactory> }>,
  ): User & { role: ReturnType<typeof mockRoleFactory> } => ({
    id: 'uuid-user-123',
    email: 'test@example.com',
    fullName: 'John Doe',
    password:
      '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012',
    phone: null,
    address: null,
    roleId: 'uuid-role-123',
    deletedAt: null,
    role: mockRoleFactory(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const reqFactory = (level = 5): RequestWithUser =>
    ({
      user: {
        id: 'uuid-admin-123',
        role: 'ADMIN',
        level,
      },
    }) as RequestWithUser;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('debería crear un usuario y retornarlo', async () => {
      const createUserDto = createUserDtoFactory();
      const req = reqFactory(5);
      const createdUser = mockUserFactory({
        email: createUserDto.email,
        fullName: createUserDto.fullName,
      });

      service.create.mockResolvedValue(createdUser as any);

      const result = await controller.createUser(createUserDto, req);

      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(req.user.level, createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('debería propagar error cuando falla creación', async () => {
      const createUserDto = createUserDtoFactory({ roleId: undefined });
      const req = reqFactory(5);
      const error = new InternalServerErrorException('failed');

      service.create.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto, req)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(service.create).toHaveBeenCalledWith(req.user.level, createUserDto);
    });
  });

  describe('findAll', () => {
    it('debería retornar usuarios con includeRole false por defecto', async () => {
      const mockUsers: User[] = [
        {
          id: 'uuid-1',
          email: 'user1@example.com',
          fullName: 'User One',
          password: 'password1',
          phone: null,
          address: null,
          roleId: 'uuid-role-1',
          deletedAt: null,
        },
        {
          id: 'uuid-2',
          email: 'user2@example.com',
          fullName: 'User Two',
          password: 'password2',
          phone: null,
          address: null,
          roleId: 'uuid-role-2',
          deletedAt: null,
        },
      ];

      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('debería convertir includeRole=true y delegar al servicio', async () => {
      const mockUsers: User[] = [];
      service.findAll.mockResolvedValue(mockUsers);

      await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
    });

    it('debería retornar una lista vacía si no hay usuarios', async () => {
      const mockUsers: User[] = [];
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllDeleted', () => {
    it('debería delegar en findAllDeleted', async () => {
      const deletedUsers: User[] = [
        {
          id: 'uuid-user-123',
          email: 'deleted@example.com',
          fullName: 'Deleted User',
          password: 'password123',
          phone: null,
          address: null,
          roleId: 'uuid-role-123',
          deletedAt: new Date(),
        },
      ];

      service.findAllDeleted.mockResolvedValue(deletedUsers);

      const result = await controller.findAllDeleted();

      expect(result).toEqual(deletedUsers);
      expect(service.findAllDeleted).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un usuario por id', async () => {
      const userId = 'uuid-user-123';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      service.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(service.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario y retornarlo', async () => {
      const userId = 'uuid-user-123';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      };

      const updatedUser: User = {
        id: userId,
        email: updateUserDto.email ?? 'test@example.com',
        fullName: updateUserDto.fullName ?? 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeRole', () => {
    it('debería cambiar el rol de un usuario y retornarlo', async () => {
      const userId = 'uuid-user-123';
      const req = reqFactory(7);
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };

      const mockNewRole = {
        id: 'uuid-new-role',
        name: 'MANAGER',
        description: 'Manager role',
      };

      const updatedUser: User & { role: typeof mockNewRole } = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-new-role',
        deletedAt: null,
        role: mockNewRole,
      };

      service.changeRole.mockResolvedValue(updatedUser as any);

      const result = await controller.changeRole(userId, req, changeUserRoleDto);

      expect(result).toEqual(updatedUser);
      expect(result.roleId).toBe('uuid-new-role');
      expect(result.role).toEqual(mockNewRole);
      expect(service.changeRole).toHaveBeenCalledWith(
        userId,
        req.user.level,
        changeUserRoleDto,
      );
      expect(service.changeRole).toHaveBeenCalledTimes(1);
    });

    it('debería propagar error del servicio', async () => {
      const userId = 'uuid-user-123';
      const req = reqFactory(3);
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };
      const error = new Error('role change failed');

      service.changeRole.mockRejectedValue(error);

      await expect(
        controller.changeRole(userId, req, changeUserRoleDto),
      ).rejects.toThrow('role change failed');
      expect(service.changeRole).toHaveBeenCalledWith(
        userId,
        req.user.level,
        changeUserRoleDto,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario (soft delete) y retornarlo', async () => {
      const userId = 'uuid-user-123';
      const deletedUser: User = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: new Date(),
      };

      service.remove.mockResolvedValue(deletedUser);

      const result = await controller.remove(userId);

      expect(result).toEqual(deletedUser);
      expect(result.deletedAt).not.toBeNull();
      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('restore', () => {
    it('debería restaurar un usuario', async () => {
      const userId = 'uuid-user-123';
      const restoredUser: User = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      service.restore.mockResolvedValue(restoredUser);

      const result = await controller.restore(userId);

      expect(result).toEqual(restoredUser);
      expect(service.restore).toHaveBeenCalledWith(userId);
      expect(service.restore).toHaveBeenCalledTimes(1);
    });
  });
});
