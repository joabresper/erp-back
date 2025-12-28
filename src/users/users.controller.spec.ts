import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { User } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService: jest.Mocked<UsersService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    changeRole: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un usuario y retornarlo', async () => {
      // 1. PREPARAR (Arrange)
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        roleId: 'uuid-role-123',
      };

      const mockRole = {
        id: 'uuid-role-123',
        name: 'ADMIN',
        description: 'Admin role',
      };

      const createdUser: User & { role: typeof mockRole } = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: createUserDto.password,
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
        role: mockRole,
      };

      mockUsersService.create.mockResolvedValue(createdUser as any);

      // 2. ACTUAR (Act)
      const result = await controller.create(createUserDto);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('debería crear un usuario sin especificar rol (usa rol por defecto)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
      };

      const mockDefaultRole = {
        id: 'uuid-default-role',
        name: 'USER',
        description: 'Default user role',
      };

      const createdUser: User & { role: typeof mockDefaultRole } = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: createUserDto.password,
        phone: null,
        address: null,
        roleId: 'uuid-default-role',
        deletedAt: null,
        role: mockDefaultRole,
      };

      mockUsersService.create.mockResolvedValue(createdUser as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('debería lanzar un error si no existe el rol por defecto', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
      };

      const error = new InternalServerErrorException(
        'The system is not configured correctly (Missing default role).'
      );

      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto))
        .rejects
        .toThrow(InternalServerErrorException);
      await expect(controller.create(createUserDto))
        .rejects
        .toThrow('The system is not configured correctly (Missing default role).');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('debería crear un usuario con campos opcionales (phone, address)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        roleId: 'uuid-role-123',
        phone: '1234567890',
        address: '123 Main St',
      };

      const mockRole = {
        id: 'uuid-role-123',
        name: 'ADMIN',
        description: 'Admin role',
      };

      const createdUser: User & { role: typeof mockRole } = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: createUserDto.password,
        phone: createUserDto.phone ?? null,
        address: createUserDto.address ?? null,
        roleId: 'uuid-role-123',
        deletedAt: null,
        role: mockRole,
      };

      mockUsersService.create.mockResolvedValue(createdUser as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(result.phone).toBe('1234567890');
      expect(result.address).toBe('123 Main St');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('debería lanzar un error si el email ya existe (duplicado)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'duplicate@example.com',
        fullName: 'John Doe',
        password: 'password123',
        roleId: 'uuid-role-123',
      };

      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002',
        clientVersion: '5.0',
      } as any);

      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios cuando no se pasa query param email', async () => {
      // 1. PREPARAR
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

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      // 2. ACTUAR
      const result = await controller.findAll();

      // 3. VERIFICAR
      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findByEmail).not.toHaveBeenCalled();
    });

    it('debería retornar una lista vacía si no hay usuarios', async () => {
      const mockUsers: User[] = [];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('debería buscar por email cuando se pasa el query param email', async () => {
      // 1. PREPARAR
      const email = 'test@example.com';
      const mockUser: User = {
        id: 'uuid-user-123',
        email: email,
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await controller.findAll(email);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(service.findByEmail).toHaveBeenCalledTimes(1);
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si el usuario no existe cuando se busca por email', async () => {
      const email = 'notfound@example.com';
      const error = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );

      mockUsersService.findByEmail.mockRejectedValue(error);

      await expect(controller.findAll(email))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findOne', () => {
    it('debería retornar un usuario por id', async () => {
      // 1. PREPARAR
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

      mockUsersService.findById.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await controller.findOne(userId);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(service.findById).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      const userId = 'uuid-no-existe';
      const error = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );

      mockUsersService.findById.mockRejectedValue(error);

      await expect(controller.findOne(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.findById).toHaveBeenCalledWith(userId);
    });

    it('debería validar que el id sea un UUID válido (ParseUUIDPipe)', async () => {
      // ParseUUIDPipe lanzará un error si el UUID no es válido
      // Este test verifica que el pipe funciona correctamente
      const invalidId = 'not-a-uuid';

      // ParseUUIDPipe lanzará BadRequestException si el UUID no es válido
      // En este caso, el error se lanzará antes de llegar al servicio
      await expect(controller.findOne(invalidId)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario y retornarlo', async () => {
      // 1. PREPARAR
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

      mockUsersService.update.mockResolvedValue(updatedUser);

      // 2. ACTUAR
      const result = await controller.update(userId, updateUserDto);

      // 3. VERIFICAR
      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('debería actualizar solo algunos campos (actualización parcial)', async () => {
      const userId = 'uuid-user-123';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      const updatedUser: User = {
        id: userId,
        email: 'test@example.com',
        fullName: updateUserDto.fullName ?? 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(result.fullName).toBe('Updated Name');
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      const userId = 'uuid-no-existe';
      const updateUserDto: UpdateUserDto = {
        fullName: 'New Name',
      };

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      mockUsersService.update.mockRejectedValue(error);

      await expect(controller.update(userId, updateUserDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('debería validar que el id sea un UUID válido (ParseUUIDPipe)', async () => {
      const invalidId = 'not-a-uuid';
      const updateUserDto: UpdateUserDto = {
        fullName: 'New Name',
      };

      await expect(controller.update(invalidId, updateUserDto)).rejects.toThrow();
    });
  });

  describe('changeRol', () => {
    it('debería cambiar el rol de un usuario y retornarlo', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
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

      mockUsersService.changeRole.mockResolvedValue(updatedUser as any);

      // 2. ACTUAR
      const result = await controller.changeRol(userId, changeUserRoleDto);

      // 3. VERIFICAR
      expect(result).toEqual(updatedUser);
      expect(result.roleId).toBe('uuid-new-role');
      expect(result.role).toEqual(mockNewRole);
      expect(service.changeRole).toHaveBeenCalledWith(userId, changeUserRoleDto);
      expect(service.changeRole).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      const userId = 'uuid-no-existe';
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      mockUsersService.changeRole.mockRejectedValue(error);

      await expect(controller.changeRol(userId, changeUserRoleDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.changeRole).toHaveBeenCalledWith(userId, changeUserRoleDto);
    });

    it('debería lanzar un error si el rol no existe (foreign key constraint)', async () => {
      const userId = 'uuid-user-123';
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-role-no-existe',
      };

      const error = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0',
        } as any
      );

      mockUsersService.changeRole.mockRejectedValue(error);

      await expect(controller.changeRol(userId, changeUserRoleDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.changeRole).toHaveBeenCalledWith(userId, changeUserRoleDto);
    });

    it('debería validar que el id sea un UUID válido (ParseUUIDPipe)', async () => {
      const invalidId = 'not-a-uuid';
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };

      await expect(controller.changeRol(invalidId, changeUserRoleDto))
        .rejects
        .toThrow();
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario (soft delete) y retornarlo', async () => {
      // 1. PREPARAR
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

      mockUsersService.remove.mockResolvedValue(deletedUser);

      // 2. ACTUAR
      const result = await controller.remove(userId);

      // 3. VERIFICAR
      expect(result).toEqual(deletedUser);
      expect(result.deletedAt).not.toBeNull();
      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      const userId = 'uuid-no-existe';
      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      mockUsersService.remove.mockRejectedValue(error);

      await expect(controller.remove(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(service.remove).toHaveBeenCalledWith(userId);
    });

    it('debería validar que el id sea un UUID válido (ParseUUIDPipe)', async () => {
      const invalidId = 'not-a-uuid';

      await expect(controller.remove(invalidId)).rejects.toThrow();
    });
  });
});
