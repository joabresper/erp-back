import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { PrismaService } from '../prisma/prisma.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: DeepMockProxy<PrismaClient>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        }
      ]
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    prisma = module.get(PrismaService)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByName', () => {
    it('debería retornar un permiso si existe', async () => {
      // 1. PREPARAR (Arrange)
      const permissionName = 'users.create';
      const mockPermission = { 
        id: 'uuid-123', 
        name: permissionName, 
        description: 'Permission to create users',
      };

      // Le decimos al mock: "Cuando te pidan findUniqueOrThrow, devuelve este objeto"
      prisma.permission.findUniqueOrThrow.mockResolvedValue(mockPermission);

      // 2. ACTUAR (Act)
      const result = await service.findByName(permissionName);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(mockPermission); // Que devuelva el objeto correcto
      expect(prisma.permission.findUniqueOrThrow).toHaveBeenCalledWith({ // Que haya llamado a Prisma con el where correcto
        where: { name: permissionName },
      });
    });

    it('debería lanzar un error de Prisma si el permiso no existe', async () => {
      // 1. PREPARAR
      const permissionName = 'GHOST_PERMISSION';
    
      // Creamos el error falso de Prisma P2025 (Record not found)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );
    
      // IMPORTANTE: Usamos 'mockRejectedValue' porque OrThrow lanza un error, no retorna null
      prisma.permission.findUniqueOrThrow.mockRejectedValue(prismaError);
    
      // 2. ACTUAR Y VERIFICAR
      // Esperamos que explote con el error nativo de Prisma
      await expect(service.findByName(permissionName))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findById', () => {
    it('debería retornar un permiso si existe', async () => {
      // 1. PREPARAR (Arrange)
      const permissionId = 'uuid-123';
      const mockPermission = { 
        id: permissionId, 
        name: 'users.create',
        description: 'Permission to create users',
      };

      // Le decimos al mock: "Cuando te pidan findUniqueOrThrow, devuelve este objeto"
      prisma.permission.findUniqueOrThrow.mockResolvedValue(mockPermission);

      // 2. ACTUAR (Act)
      const result = await service.findById(permissionId);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(mockPermission); // Que devuelva el objeto correcto
      expect(prisma.permission.findUniqueOrThrow).toHaveBeenCalledWith({ // Que haya llamado a Prisma con el where correcto
        where: { id: permissionId },
      });
    });

    it('debería lanzar un error de Prisma si el permiso no existe', async () => {
      // 1. PREPARAR
      const permissionId = 'uuid-no-existe';
    
      // Creamos el error falso de Prisma P2025 (Record not found)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );
    
      // IMPORTANTE: Usamos 'mockRejectedValue' porque OrThrow lanza un error, no retorna null
      prisma.permission.findUniqueOrThrow.mockRejectedValue(prismaError);
    
      // 2. ACTUAR Y VERIFICAR
      // Esperamos que explote con el error nativo de Prisma
      await expect(service.findById(permissionId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('create', () => {
    it('deberia crear el permiso', async () => {
      const dto = {
        name: 'users.create',
        description: 'Permission to create users',
      };
      const resultObj = {
        id: 'uuid-1',
        ...dto,
      };

      prisma.permission.create.mockResolvedValue(resultObj);

      const result = await service.create(dto);
      expect(result).toEqual(resultObj);
      expect(prisma.permission.create).toHaveBeenCalledWith({data: dto})
    });

    it('deberia crear el permiso solo con name (sin description)', async () => {
      const dto = {
        name: 'users.read',
      };
      const resultObj = {
        id: 'uuid-2',
        name: dto.name,
        description: null,
      };

      prisma.permission.create.mockResolvedValue(resultObj);

      const result = await service.create(dto);
      expect(result).toEqual(resultObj);
      expect(prisma.permission.create).toHaveBeenCalledWith({data: dto})
    });

    it('deberia fallar la creacion si ya existe ', async () => {
      // 1. Simulamos que PRISMA explota con el error P2002
      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002', clientVersion: '5.0' 
      } as any);
    
      prisma.permission.create.mockRejectedValue(error);

      // 2. Esperamos que el error de Prisma suba (el Filtro Global lo atrapará después)
      await expect(service.create({ name: 'DUPLICADO' }))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findAll', () => {
    it('deberia devolver todos los permisos guardados', async () => {
      const mockPermissions = [
        {
          id: 'uuid-1',
          name: 'users.create',
          description: null
        },
        {
          id: 'uuid-2',
          name: 'users.read',
          description: null
        },
        {
          id: 'uuid-3',
          name: 'users.update',
          description: null
        }
      ];

      prisma.permission.findMany.mockResolvedValue(mockPermissions);
      const result = await service.findAll();
      expect(result).toEqual(mockPermissions);
      expect(prisma.permission.findMany).toHaveBeenCalledTimes(1);
    });

    it('deberia devolver una lista vacia si no hay permisos guardados', async () => {
      const mockPermissions = [];

      prisma.permission.findMany.mockResolvedValue(mockPermissions);
      const result = await service.findAll();

      expect(result).toEqual(mockPermissions);
      expect(prisma.permission.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('deberia actualizar un permiso existente correctamente', async () => {
      const permissionId = 'uuid-123';
      const updatePermissionDto = {
        name: 'users.edit',
        description: 'Nueva descripcion'
      };
      const updatedPermission = {
        id: permissionId,
        name: updatePermissionDto.name,
        description: updatePermissionDto.description
      };

      prisma.permission.update.mockResolvedValue(updatedPermission);

      const result = await service.update(permissionId, updatePermissionDto);

      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: permissionId },
        data: updatePermissionDto,
      });
      expect(result).toEqual(updatedPermission);
    });

    it('deberia actualizar solo algunos campos (actualizacion parcial)', async () => {
      const permissionId = 'uuid-123';
      const updatePermissionDto = {
        description: 'Solo actualizo la descripcion'
      };
      const updatedPermission = {
        id: permissionId,
        name: 'users.create', // Se mantiene el nombre original
        description: updatePermissionDto.description
      };

      prisma.permission.update.mockResolvedValue(updatedPermission);

      const result = await service.update(permissionId, updatePermissionDto);

      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: permissionId },
        data: updatePermissionDto,
      });
      expect(result).toEqual(updatedPermission);
    });

    it('deberia lanzar un error si el permiso no existe', async () => {
      const permissionId = 'uuid-xxx';
      const updatePermissionDto = {
        name: 'Nuevo',
        description: 'desc'
      };

      const error = new Prisma.PrismaClientKnownRequestError('Permission not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);
      prisma.permission.update.mockRejectedValue(error);

      await expect(service.update(permissionId, updatePermissionDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: permissionId },
        data: updatePermissionDto,
      });
    });

    it('deberia fallar la actualizacion si el nuevo nombre ya existe (duplicado)', async () => {
      const permissionId = 'uuid-123';
      const updatePermissionDto = {
        name: 'DUPLICADO',
      };

      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002', clientVersion: '5.0' 
      } as any);
      prisma.permission.update.mockRejectedValue(error);

      await expect(service.update(permissionId, updatePermissionDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: permissionId },
        data: updatePermissionDto,
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un permiso existente correctamente', async () => {
      const permissionId = 'uuid-123';
      const deletedPermission = {
        id: permissionId,
        name: 'users.delete',
        description: 'Permission to delete users'
      };

      prisma.permission.delete.mockResolvedValue(deletedPermission);

      const result = await service.remove(permissionId);

      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
      expect(result).toEqual(deletedPermission);
    });

    it('debería lanzar un error si el permiso no existe', async () => {
      const permissionId = 'uuid-no-existe';
      const error = new Prisma.PrismaClientKnownRequestError('Permission not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);

      prisma.permission.delete.mockRejectedValue(error);

      await expect(service.remove(permissionId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
    });

    it('debería lanzar un error si el permiso tiene relaciones (foreign key constraint)', async () => {
      const permissionId = 'uuid-con-relaciones';
      const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003', clientVersion: '5.0'
      } as any);

      prisma.permission.delete.mockRejectedValue(error);

      await expect(service.remove(permissionId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
    });
  });

})

