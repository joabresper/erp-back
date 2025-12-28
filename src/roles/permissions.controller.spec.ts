import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;

  const mockPermission = {
    id: '1',
    name: 'users.create',
    description: 'Permission to create users'
  };

  const mockService = {
    create: jest.fn().mockImplementation((dto) => ({
      id: '1',
      ...dto,
    })),
    findAll: jest.fn().mockResolvedValue([mockPermission]),
    findById: jest.fn().mockImplementation((id: string) => ({
      ...mockPermission,
      id,
    })),
    update: jest.fn().mockImplementation((id: string, dto) => ({
      id,
      ...dto,
    })),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const dto: CreatePermissionDto = {
        name: 'users.create',
        description: 'Permission to create users'
      };
      expect(await controller.create(dto)).toEqual({
        id: expect.any(String),
        ...dto,
      });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockPermission]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single permission by id', async () => {
      const id = '1';
      const result = await controller.findOne(id);
      expect(result).toEqual({ ...mockPermission, id });
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const id = '1';
      const dto: UpdatePermissionDto = { name: 'users.update' };
      const result = await controller.update(id, dto);
      expect(result).toEqual({
        id,
        ...dto,
      });
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
