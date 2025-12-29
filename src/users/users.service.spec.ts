import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { RolesService } from 'src/roles/roles.service';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserRoleDto } from './dto/change-user-rol.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from 'src/common/providers/hashing.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;
  let rolesService: RolesService;
  let hashingService: HashingService;

  const mockRolesService = {
    findByName: jest.fn(),
  };

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
    rolesService = module.get<RolesService>(RolesService);
    hashingService = module.get<HashingService>(HashingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un usuario con rol especificado', async () => {
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

      const hashedPassword = '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012';
      const mockUser = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: hashedPassword,
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
        role: mockRole,
      };

      mockHashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      // 2. ACTUAR (Act)
      const result = await service.create(createUserDto);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: createUserDto.fullName,
          password: hashedPassword,
          email: createUserDto.email,
          role: {
            connect: { id: createUserDto.roleId },
          },
        },
        include: { role: true },
      });
      expect(rolesService.findByName).not.toHaveBeenCalled();
    });

    it('debería crear un usuario con rol por defecto cuando no se especifica rol', async () => {
      // 1. PREPARAR
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

      const hashedPassword = '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012';
      const mockUser = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: hashedPassword,
        phone: null,
        address: null,
        roleId: 'uuid-default-role',
        deletedAt: null,
        role: mockDefaultRole,
      };

      mockRolesService.findByName.mockResolvedValue(mockDefaultRole);
      mockHashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await service.create(createUserDto);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(rolesService.findByName).toHaveBeenCalledWith('USER');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: createUserDto.fullName,
          password: hashedPassword,
          email: createUserDto.email,
          role: {
            connect: { id: mockDefaultRole.id },
          },
        },
        include: { role: true },
      });
    });

    it('debería lanzar InternalServerErrorException si no existe el rol por defecto', async () => {
      // 1. PREPARAR
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
      };

      mockRolesService.findByName.mockResolvedValue(null);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.create(createUserDto))
        .rejects
        .toThrow(InternalServerErrorException);
      await expect(service.create(createUserDto))
        .rejects
        .toThrow('The system is not configured correctly (Missing default role).');
      expect(rolesService.findByName).toHaveBeenCalledWith('USER');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('debería encriptar la contraseña antes de guardarla', async () => {
      // 1. PREPARAR
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'plainPassword123',
        roleId: 'uuid-role-123',
      };

      const hashedPassword = '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012';
      const mockUser = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: hashedPassword, // La contraseña se guarda encriptada
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
        role: {
          id: 'uuid-role-123',
          name: 'ADMIN',
          description: 'Admin role',
        },
      };

      mockHashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await service.create(createUserDto);

      // 3. VERIFICAR
      expect(result.password).toBe(hashedPassword);
      expect(result.password).not.toBe(createUserDto.password); // La contraseña no debe ser la original
      expect(mockHashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(mockHashingService.hash).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: createUserDto.fullName,
          password: hashedPassword,
          email: createUserDto.email,
          role: {
            connect: { id: createUserDto.roleId },
          },
        },
        include: { role: true },
      });
    });

    it('debería crear un usuario con campos opcionales (phone, address)', async () => {
      // 1. PREPARAR
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        roleId: 'uuid-role-123',
        phone: '1234567890',
        address: '123 Main St',
      };

      const hashedPassword = '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012';
      const mockUser = {
        id: 'uuid-user-123',
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: hashedPassword,
        phone: createUserDto.phone ?? null,
        address: createUserDto.address ?? null,
        roleId: 'uuid-role-123',
        deletedAt: null,
        role: {
          id: 'uuid-role-123',
          name: 'ADMIN',
          description: 'Admin role',
        },
      };

      mockHashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await service.create(createUserDto);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(result.phone).toBe('1234567890');
      expect(result.address).toBe('123 Main St');
    });

    it('debería lanzar un error si el email ya existe (duplicado)', async () => {
      // 1. PREPARAR
      const createUserDto: CreateUserDto = {
        email: 'duplicate@example.com',
        fullName: 'John Doe',
        password: 'password123',
        roleId: 'uuid-role-123',
      };

      const hashedPassword = '$2b$10$hashedPassword1234567890123456789012345678901234567890123456789012';
      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002',
        clientVersion: '5.0',
      } as any);

      mockHashingService.hash.mockResolvedValue(hashedPassword);
      prisma.user.create.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.create(createUserDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('debería propagar el error si el hashing de la contraseña falla', async () => {
      // 1. PREPARAR
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        roleId: 'uuid-role-123',
      };

      const hashingError = new Error('Hashing failed');
      mockHashingService.hash.mockRejectedValue(hashingError);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.create(createUserDto))
        .rejects
        .toThrow('Hashing failed');
      expect(mockHashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(mockHashingService.hash).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios no eliminados', async () => {
      // 1. PREPARAR
      const mockUsers = [
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

      prisma.user.findMany.mockResolvedValue(mockUsers);

      // 2. ACTUAR
      const result = await service.findAll();

      // 3. VERIFICAR
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('debería retornar una lista vacía si no hay usuarios', async () => {
      // 1. PREPARAR
      const mockUsers: any[] = [];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      // 2. ACTUAR
      const result = await service.findAll();

      // 3. VERIFICAR
      expect(result).toEqual([]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });

    it('no debería retornar usuarios eliminados', async () => {
      // 1. PREPARAR
      const mockUsers = [
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
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      // 2. ACTUAR
      const result = await service.findAll();

      // 3. VERIFICAR
      expect(result).toEqual(mockUsers);
      expect(result.every((user) => user.deletedAt === null)).toBe(true);
    });
  });

  describe('findById', () => {
    it('debería retornar un usuario si existe', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      prisma.user.findFirstOrThrow.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await service.findById(userId);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
      });
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      // 1. PREPARAR
      const userId = 'uuid-no-existe';

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );

      prisma.user.findFirstOrThrow.mockRejectedValue(prismaError);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.findById(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
      });
    });

    it('no debería retornar usuarios eliminados', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );

      prisma.user.findFirstOrThrow.mockRejectedValue(prismaError);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.findById(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('debería retornar un usuario si existe con el email proporcionado', async () => {
      // 1. PREPARAR
      const userEmail = 'test@example.com';
      const mockUser = {
        id: 'uuid-user-123',
        email: userEmail,
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      prisma.user.findFirstOrThrow.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await service.findByEmail(userEmail);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(result.email).toBe(userEmail);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          email: userEmail,
          deletedAt: null,
        },
      });
    });

    it('debería lanzar un error si el usuario no existe con ese email', async () => {
      // 1. PREPARAR
      const userEmail = 'notfound@example.com';

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );

      prisma.user.findFirstOrThrow.mockRejectedValue(prismaError);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.findByEmail(userEmail))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          email: userEmail,
          deletedAt: null,
        },
      });
    });

    it('no debería retornar usuarios eliminados', async () => {
      // 1. PREPARAR
      const userEmail = 'deleted@example.com';

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );

      prisma.user.findFirstOrThrow.mockRejectedValue(prismaError);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.findByEmail(userEmail))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          email: userEmail,
          deletedAt: null,
        },
      });
    });

    it('debería buscar por email exacto (case sensitive)', async () => {
      // 1. PREPARAR
      const userEmail = 'Test@Example.com';
      const mockUser = {
        id: 'uuid-user-123',
        email: userEmail,
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      prisma.user.findFirstOrThrow.mockResolvedValue(mockUser);

      // 2. ACTUAR
      const result = await service.findByEmail(userEmail);

      // 3. VERIFICAR
      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          email: userEmail,
          deletedAt: null,
        },
      });
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario existente correctamente', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      };

      const updatedUser = {
        id: userId,
        email: updateUserDto.email ?? 'test@example.com',
        fullName: updateUserDto.fullName ?? 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      prisma.user.update.mockResolvedValue(updatedUser);

      // 2. ACTUAR
      const result = await service.update(userId, updateUserDto);

      // 3. VERIFICAR
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: updateUserDto,
      });
    });

    it('debería actualizar solo algunos campos (actualización parcial)', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        fullName: updateUserDto.fullName ?? 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      prisma.user.update.mockResolvedValue(updatedUser);

      // 2. ACTUAR
      const result = await service.update(userId, updateUserDto);

      // 3. VERIFICAR
      expect(result).toEqual(updatedUser);
      expect(result.fullName).toBe('Updated Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: updateUserDto,
      });
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      // 1. PREPARAR
      const userId = 'uuid-no-existe';
      const updateUserDto: UpdateUserDto = {
        fullName: 'New Name',
      };

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.update(userId, updateUserDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: updateUserDto,
      });
    });

    it('debería fallar la actualización si el nuevo email ya existe (duplicado)', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const updateUserDto: UpdateUserDto = {
        email: 'duplicate@example.com',
      };

      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002',
        clientVersion: '5.0',
      } as any);

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.update(userId, updateUserDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('remove', () => {
    it('debería realizar una eliminación lógica (soft delete) correctamente', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const deletedUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: new Date(),
      };

      prisma.user.update.mockResolvedValue(deletedUser);

      // 2. ACTUAR
      const result = await service.remove(userId);

      // 3. VERIFICAR
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

    it('debería lanzar un error si el usuario no existe', async () => {
      // 1. PREPARAR
      const userId = 'uuid-no-existe';

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.remove(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
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

    it('no debería eliminar un usuario que ya está eliminado', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-eliminado';

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.remove(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findAllDeleted', () => {
    it('debería retornar todos los usuarios eliminados', async () => {
      // 1. PREPARAR
      const mockDeletedUsers = [
        {
          id: 'uuid-1',
          email: 'deleted1@example.com',
          fullName: 'Deleted User One',
          password: 'password1',
          phone: null,
          address: null,
          roleId: 'uuid-role-1',
          deletedAt: new Date('2024-01-01'),
        },
        {
          id: 'uuid-2',
          email: 'deleted2@example.com',
          fullName: 'Deleted User Two',
          password: 'password2',
          phone: null,
          address: null,
          roleId: 'uuid-role-2',
          deletedAt: new Date('2024-01-02'),
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockDeletedUsers);

      // 2. ACTUAR
      const result = await service.findAllDeleted();

      // 3. VERIFICAR
      expect(result).toEqual(mockDeletedUsers);
      expect(result.every((user) => user.deletedAt !== null)).toBe(true);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: { not: null },
        },
      });
    });

    it('debería retornar una lista vacía si no hay usuarios eliminados', async () => {
      // 1. PREPARAR
      const mockDeletedUsers: any[] = [];

      prisma.user.findMany.mockResolvedValue(mockDeletedUsers);

      // 2. ACTUAR
      const result = await service.findAllDeleted();

      // 3. VERIFICAR
      expect(result).toEqual([]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: { not: null },
        },
      });
    });
  });

  describe('restore', () => {
    it('debería restaurar un usuario eliminado correctamente', async () => {
      // 1. PREPARAR
      const userId = 'uuid-user-123';
      const restoredUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        password: 'password123',
        phone: null,
        address: null,
        roleId: 'uuid-role-123',
        deletedAt: null,
      };

      prisma.user.update.mockResolvedValue(restoredUser);

      // 2. ACTUAR
      const result = await service.restore(userId);

      // 3. VERIFICAR
      expect(result).toEqual(restoredUser);
      expect(result.deletedAt).toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { deletedAt: null },
      });
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      // 1. PREPARAR
      const userId = 'uuid-no-existe';

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.restore(userId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { deletedAt: null },
      });
    });
  });

  describe('changeRole', () => {
    it('debería cambiar el rol de un usuario correctamente', async () => {
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

      const updatedUser = {
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

      prisma.user.update.mockResolvedValue(updatedUser);

      // 2. ACTUAR
      const result = await service.changeRole(userId, changeUserRoleDto);

      // 3. VERIFICAR
      expect(result).toEqual(updatedUser);
      expect(result.roleId).toBe('uuid-new-role');
      expect(result.role).toEqual(mockNewRole);
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

    it('debería lanzar un error si el usuario no existe', async () => {
      // 1. PREPARAR
      const userId = 'uuid-no-existe';
      const changeUserRoleDto: ChangeUserRoleDto = {
        roleId: 'uuid-new-role',
      };

      const error = new Prisma.PrismaClientKnownRequestError('User not found', {
        code: 'P2025',
        clientVersion: '5.0',
      } as any);

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.changeRole(userId, changeUserRoleDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
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

    it('debería lanzar un error si el rol no existe (foreign key constraint)', async () => {
      // 1. PREPARAR
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

      prisma.user.update.mockRejectedValue(error);

      // 2. ACTUAR Y VERIFICAR
      await expect(service.changeRole(userId, changeUserRoleDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });
});
