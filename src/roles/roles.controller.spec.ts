import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService: jest.Mocked<RolesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un rol y retornarlo', async () => {
      // 1. PREPARAR (Arrange)
      const createRoleDto: CreateRoleDto = {
        name: 'ADMIN',
        description: 'Admin role',
      };
      const createdRole: Role = {
        id: 'uuid-123',
        name: createRoleDto.name,
        description: createRoleDto.description ?? null,
      };

      mockRolesService.create.mockResolvedValue(createdRole);

      // 2. ACTUAR (Act)
      const result = await controller.create(createRoleDto);

      // 3. VERIFICAR (Assert)
      expect(result).toEqual(createdRole);
      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('debería crear un rol solo con name (sin description)', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'USER',
      };
      const createdRole: Role = {
        id: 'uuid-456',
        name: createRoleDto.name,
        description: null,
      };

      mockRolesService.create.mockResolvedValue(createdRole);

      const result = await controller.create(createRoleDto);

      expect(result).toEqual(createdRole);
      expect(service.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los roles', async () => {
      // 1. PREPARAR
      const mockRoles: Role[] = [
        {
          id: 'uuid-1',
          name: 'ADMIN',
          description: 'Admin role',
        },
        {
          id: 'uuid-2',
          name: 'USER',
          description: 'User role',
        },
      ];

      mockRolesService.findAll.mockResolvedValue(mockRoles);

      // 2. ACTUAR
      const result = await controller.findAll();

      // 3. VERIFICAR
      expect(result).toEqual(mockRoles);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith();
    });

    it('debería retornar una lista vacía si no hay roles', async () => {
      const mockRoles: Role[] = [];
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(result).toEqual(mockRoles);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un rol por id', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-123';
      const mockRole: Role = {
        id: roleId,
        name: 'ADMIN',
        description: 'Admin role',
      };

      mockRolesService.findById.mockResolvedValue(mockRole);

      // 2. ACTUAR
      const result = await controller.findOne(roleId);

      // 3. VERIFICAR
      expect(result).toEqual(mockRole);
      expect(service.findById).toHaveBeenCalledWith(roleId);
      expect(service.findById).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const error = new Error('Role not found');

      mockRolesService.findById.mockRejectedValue(error);

      await expect(controller.findOne(roleId)).rejects.toThrow('Role not found');
      expect(service.findById).toHaveBeenCalledWith(roleId);
    });
  });

  describe('update', () => {
    it('debería actualizar un rol y retornarlo', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-123';
      const updateRoleDto: UpdateRoleDto = {
        name: 'ADMIN_UPDATED',
        description: 'Updated admin role',
      };
      const updatedRole: Role = {
        id: roleId,
        name: updateRoleDto.name ?? 'ADMIN',
        description: updateRoleDto.description ?? null,
      };

      mockRolesService.update.mockResolvedValue(updatedRole);

      // 2. ACTUAR
      const result = await controller.update(roleId, updateRoleDto);

      // 3. VERIFICAR
      expect(result).toEqual(updatedRole);
      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('debería actualizar solo algunos campos (actualización parcial)', async () => {
      const roleId = 'uuid-123';
      const updateRoleDto: UpdateRoleDto = {
        description: 'Solo actualizo la descripción',
      };
      const updatedRole: Role = {
        id: roleId,
        name: 'ADMIN',
        description: updateRoleDto.description ?? null,
      };

      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateRoleDto);

      expect(result).toEqual(updatedRole);
      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const updateRoleDto: UpdateRoleDto = {
        name: 'NEW_NAME',
      };
      const error = new Error('Role not found');

      mockRolesService.update.mockRejectedValue(error);

      await expect(controller.update(roleId, updateRoleDto)).rejects.toThrow('Role not found');
      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
    });
  });

  describe('remove', () => {
    it('debería eliminar un rol y retornarlo', async () => {
      // 1. PREPARAR
      const roleId = 'uuid-123';
      const deletedRole: Role = {
        id: roleId,
        name: 'ADMIN',
        description: 'Admin role',
      };

      mockRolesService.remove.mockResolvedValue(deletedRole);

      // 2. ACTUAR
      const result = await controller.remove(roleId);

      // 3. VERIFICAR
      expect(result).toEqual(deletedRole);
      expect(service.remove).toHaveBeenCalledWith(roleId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error si el rol no existe', async () => {
      const roleId = 'uuid-no-existe';
      const error = new Error('Role not found');

      mockRolesService.remove.mockRejectedValue(error);

      await expect(controller.remove(roleId)).rejects.toThrow('Role not found');
      expect(service.remove).toHaveBeenCalledWith(roleId);
    });
  });
});
