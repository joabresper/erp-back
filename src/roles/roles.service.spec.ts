import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Prisma } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: DeepMockProxy<PrismaService>;
  let permissionsService: DeepMockProxy<PermissionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: PermissionsService,
          useValue: mockDeep<PermissionsService>(),
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get(PrismaService);
    permissionsService = module.get(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByName', () => {
    it('debería retornar un rol si existe', async () => {
      // 1. PREPARAR (Arrange)
      const roleName = 'ADMIN';
      const mockRole = { 
        id: 'uuid-123', 
        name: roleName, 
        description: 'Admin role',
      };

      // Le decimos al mock: "Cuando te pidan findUnique, devuelve este objeto"
      prisma.role.findUniqueOrThrow.mockResolvedValue(mockRole);

      // 2. ACTUAR (Act)
      const result = await service.findByName(roleName);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(mockRole); // Que devuelva el objeto correcto
      expect(prisma.role.findUniqueOrThrow).toHaveBeenCalledWith({ // Que haya llamado a Prisma con el where correcto
        where: { name: roleName },
      });
    });

    it('debería lanzar un error de Prisma si el rol no existe', async () => {
      // 1. PREPARAR
      const roleName = 'GHOST_ROLE';
    
      // Creamos el error falso de Prisma P2025 (Record not found)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );
    
      // IMPORTANTE: Usamos 'mockRejectedValue' porque OrThrow lanza un error, no retorna null
      prisma.role.findUniqueOrThrow.mockRejectedValue(prismaError);
    
      // 2. ACTUAR Y VERIFICAR
      // Esperamos que explote con el error nativo de Prisma
      await expect(service.findByName(roleName))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findById', () => {
    it('debería retornar un rol si existe', async () => {
      // 1. PREPARAR (Arrange)
      const roleId = 'uuid-123';
      const mockRole = { 
        id: roleId, 
        name: 'ADMIN',
        description: 'Admin role',
      };

      // Le decimos al mock: "Cuando te pidan findUniqueOrThrow, devuelve este objeto"
      prisma.role.findUniqueOrThrow.mockResolvedValue(mockRole);

      // 2. ACTUAR (Act)
      const result = await service.findById(roleId);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(mockRole); // Que devuelva el objeto correcto
      expect(prisma.role.findUniqueOrThrow).toHaveBeenCalledWith({ // Que haya llamado a Prisma con el where correcto
        where: { id: roleId },
      });
    });

    it('debería lanzar un error de Prisma si el rol no existe', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-no-existe';
    
      // Creamos el error falso de Prisma P2025 (Record not found)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'No se encontró el registro',
        { code: 'P2025', clientVersion: '5.0.0' } as any
      );
    
      // IMPORTANTE: Usamos 'mockRejectedValue' porque OrThrow lanza un error, no retorna null
      prisma.role.findUniqueOrThrow.mockRejectedValue(prismaError);
    
      // 2. ACTUAR Y VERIFICAR
      // Esperamos que explote con el error nativo de Prisma
      await expect(service.findById(roleId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('create', () => {
    it('deberia crear el rol', async () => {
      const dto = {
        name: 'ADMIN',
        description: 'Admin role',
      };
      const resultObj = {
        id: 'uuid-1',
        ...dto,
      };

      prisma.role.create.mockResolvedValue(resultObj);

      const result = await service.create(dto);
      expect(result).toEqual(resultObj);
      expect(prisma.role.create).toHaveBeenCalledWith({data: dto})
    });

    it('deberia crear el rol solo con name (sin description)', async () => {
      const dto = {
        name: 'USER',
      };
      const resultObj = {
        id: 'uuid-2',
        name: dto.name,
        description: null,
      };

      prisma.role.create.mockResolvedValue(resultObj);

      const result = await service.create(dto);
      expect(result).toEqual(resultObj);
      expect(prisma.role.create).toHaveBeenCalledWith({data: dto})
    });

    it('deberia fallar la creacion si ya existe ', async () => {
      // 1. Simulamos que PRISMA explota con el error P2002
      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002', clientVersion: '5.0' 
      } as any);
    
      prisma.role.create.mockRejectedValue(error);

      // 2. Esperamos que el error de Prisma suba (el Filtro Global lo atrapará después)
      await expect(service.create({ name: 'DUPLICADO' }))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findAll', () => {
    it('deberia devolver todos los roles guardados', async () => {
      const mockRoles = [
        {
          id: 'uuid-1',
          name: 'ADMIN',
          description: null
        },
        {
          id: 'uuid-2',
          name: 'USER',
          description: null
        },
        {
          id: 'uuid-3',
          name: 'MANAGER',
          description: null
        }
      ];

      prisma.role.findMany.mockResolvedValue(mockRoles);
      const result = await service.findAll();
      expect(result).toEqual(mockRoles);
      expect(prisma.role.findMany).toHaveBeenCalledTimes(1);
    });

    it('deberia devolver una lista vacia si no hay roles guardados', async () => {
      const mockRoles = [];

      prisma.role.findMany.mockResolvedValue(mockRoles);
      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(prisma.role.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('deberia actualizar un role existente correctamente', async () => {
      const roleId = 'uuid-123';
      const updateRoleDto = {
        name: 'NEW_NAME',
        description: 'Nueva descripcion'
      };
      const updatedRole = {
        id: roleId,
        name: updateRoleDto.name,
        description: updateRoleDto.description
      };

      prisma.role.update.mockResolvedValue(updatedRole);

      const result = await service.update(roleId, updateRoleDto);

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: updateRoleDto,
      });
      expect(result).toEqual(updatedRole);
    });

    it('deberia actualizar solo algunos campos (actualizacion parcial)', async () => {
      const roleId = 'uuid-123';
      const updateRoleDto = {
        description: 'Solo actualizo la descripcion'
      };
      const updatedRole = {
        id: roleId,
        name: 'ADMIN', // Se mantiene el nombre original
        description: updateRoleDto.description
      };

      prisma.role.update.mockResolvedValue(updatedRole);

      const result = await service.update(roleId, updateRoleDto);

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: updateRoleDto,
      });
      expect(result).toEqual(updatedRole);
    });

    it('deberia lanzar un error si el role no existe', async () => {
      const roleId = 'uuid-xxx';
      const updateRoleDto = {
        name: 'Nuevo',
        description: 'desc'
      };

      const error = new Prisma.PrismaClientKnownRequestError('Role not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);
      prisma.role.update.mockRejectedValue(error);

      await expect(service.update(roleId, updateRoleDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: updateRoleDto,
      });
    });

    it('deberia fallar la actualizacion si el nuevo nombre ya existe (duplicado)', async () => {
      const roleId = 'uuid-123';
      const updateRoleDto = {
        name: 'DUPLICADO',
      };

      const error = new Prisma.PrismaClientKnownRequestError('Duplicado', {
        code: 'P2002', clientVersion: '5.0' 
      } as any);
      prisma.role.update.mockRejectedValue(error);

      await expect(service.update(roleId, updateRoleDto))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: updateRoleDto,
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un rol existente correctamente', async () => {
      const roleId = 'uuid-123';
      const deletedRole = {
        id: roleId,
        name: 'USER',
        description: 'Descripcion usuario'
      };

      prisma.role.delete.mockResolvedValue(deletedRole);

      const result = await service.remove(roleId);

      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(result).toEqual(deletedRole);
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const error = new Prisma.PrismaClientKnownRequestError('Role not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);

      prisma.role.delete.mockRejectedValue(error);

      await expect(service.remove(roleId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });

    it('debería lanzar un error si el rol tiene relaciones (foreign key constraint)', async () => {
      const roleId = 'uuid-con-relaciones';
      const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003', clientVersion: '5.0'
      } as any);

      prisma.role.delete.mockRejectedValue(error);

      await expect(service.remove(roleId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });
  });

  describe('addPermission', () => {
    it('debería agregar un permiso a un rol correctamente', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-123';
      const permissionId = 'uuid-perm-1';
      const mockPermission = {
        id: permissionId,
        name: 'users.create',
        description: 'Permission to create users',
      };
      const updatedRole = {
        id: roleId,
        name: 'ADMIN',
        description: 'Admin role',
        permissions: [mockPermission],
      };

      prisma.role.update.mockResolvedValue(updatedRole);

      // 2. ACTUAR
      const result = await service.addPermission(roleId, permissionId);

      // 3. VERIFICAR
      expect(result).toEqual(updatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            connect: { id: permissionId },
          },
        },
        include: { permissions: true },
      });
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const permissionId = 'uuid-perm-1';
      const error = new Prisma.PrismaClientKnownRequestError('Role not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);

      prisma.role.update.mockRejectedValue(error);

      await expect(service.addPermission(roleId, permissionId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            connect: { id: permissionId },
          },
        },
        include: { permissions: true },
      });
    });
  });

  describe('removePermission', () => {
    it('debería remover un permiso de un rol correctamente', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-123';
      const permissionId = 'uuid-perm-1';
      const updatedRole = {
        id: roleId,
        name: 'ADMIN',
        description: 'Admin role',
        permissions: [],
      };

      prisma.role.update.mockResolvedValue(updatedRole);

      // 2. ACTUAR
      const result = await service.removePermission(roleId, permissionId);

      // 3. VERIFICAR
      expect(result).toEqual(updatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            disconnect: { id: permissionId },
          },
        },
        include: { permissions: true },
      });
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const permissionId = 'uuid-perm-1';
      const error = new Prisma.PrismaClientKnownRequestError('Role not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);

      prisma.role.update.mockRejectedValue(error);

      await expect(service.removePermission(roleId, permissionId))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            disconnect: { id: permissionId },
          },
        },
        include: { permissions: true },
      });
    });
  });

  describe('updatePermissions', () => {
    it('debería actualizar todos los permisos de un rol correctamente', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-123';
      const permissionIds = ['uuid-perm-1', 'uuid-perm-2'];
      const mockPermissions = [
        {
          id: 'uuid-perm-1',
          name: 'users.create',
          description: 'Permission to create users',
        },
        {
          id: 'uuid-perm-2',
          name: 'users.update',
          description: 'Permission to update users',
        },
      ];
      const updatedRole = {
        id: roleId,
        name: 'ADMIN',
        description: 'Admin role',
        permissions: mockPermissions,
      };

      prisma.role.update.mockResolvedValue(updatedRole);

      // 2. ACTUAR
      const result = await service.updatePermissions(roleId, permissionIds);

      // 3. VERIFICAR
      expect(result).toEqual(updatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            set: [],
            connect: permissionIds.map((id) => ({ id })),
          },
        },
        include: { permissions: true },
      });
    });

    it('debería actualizar con un array vacío de permisos', async () => {
      const roleId = 'uuid-123';
      const permissionIds: string[] = [];
      const updatedRole = {
        id: roleId,
        name: 'ADMIN',
        description: 'Admin role',
        permissions: [],
      };

      prisma.role.update.mockResolvedValue(updatedRole);

      const result = await service.updatePermissions(roleId, permissionIds);

      expect(result).toEqual(updatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            set: [],
            connect: [],
          },
        },
        include: { permissions: true },
      });
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const permissionIds = ['uuid-perm-1'];
      const error = new Prisma.PrismaClientKnownRequestError('Role not found', {
        code: 'P2025', clientVersion: '5.0'
      } as any);

      prisma.role.update.mockRejectedValue(error);

      await expect(service.updatePermissions(roleId, permissionIds))
        .rejects
        .toThrow(Prisma.PrismaClientKnownRequestError);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: roleId },
        data: {
          permissions: {
            set: [],
            connect: permissionIds.map((id) => ({ id })),
          },
        },
        include: { permissions: true },
      });
    });
  });

})
