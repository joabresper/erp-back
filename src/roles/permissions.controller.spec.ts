import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: DeepMockProxy<PermissionsService>;

  const mockPermission = {
    id: '1',
    name: 'users.create',
    description: 'Permission to create users',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockDeep<PermissionsService>(),
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      service.findAll.mockResolvedValue([mockPermission]);

      const result = await controller.findAll();

      expect(result).toEqual([mockPermission]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single permission by id', async () => {
      const id = '1';
      service.findById.mockResolvedValue({ ...mockPermission, id });

      const result = await controller.findOne(id);

      expect(result).toEqual({ ...mockPermission, id });
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });
});
