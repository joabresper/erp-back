import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { ProductType, UnitMeasure } from '@prisma/client';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sku: 'SKU001',
    name: 'Test Product',
    description: 'Test Description',
    price: 100.50,
    type: ProductType.GENERIC,
    unit: UnitMeasure.UNIT,
    isSalable: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    changeStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct DTO', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'SKU001',
        name: 'New Product',
        price: 100.50,
        description: 'Test Description',
        type: ProductType.GENERIC,
        unit: UnitMeasure.UNIT,
        isSalable: true,
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toBeDefined();
    });

    it('should propagate service errors on create', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'SKU001',
        name: 'New Product',
        price: 100.50,
        description: 'Test Description',
        type: ProductType.GENERIC,
        unit: UnitMeasure.UNIT,
        isSalable: true,
      };

      mockProductsService.create.mockRejectedValue(new Error('Service error'));

      await expect(controller.create(createProductDto)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return array of products', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll('false');

      expect(mockProductsService.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(products);
    });

    it('should call service.findAll with includeHistory true', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll('true');

      expect(mockProductsService.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(products);
    });

    it('should call service.findAll with includeHistory false when query is undefined', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(undefined);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(products);
    });

    it('should propagate service errors on findAll', async () => {
      mockProductsService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll('false')).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct ID and includeHistory false', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId, 'false');

      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId, false);
      expect(result).toEqual(mockProduct);
    });

    it('should call service.findOne with correct ID and includeHistory true', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId, 'true');

      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId, true);
      expect(result).toEqual(mockProduct);
    });

    it('should call service.findOne with includeHistory false when query is undefined', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId, undefined);

      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId, false);
      expect(result).toEqual(mockProduct);
    });

    it('should propagate service errors on findOne', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.findOne.mockRejectedValue(new Error('Service error'));

      await expect(controller.findOne(productId, 'true')).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('update', () => {
    it('should call service.update with ID and DTO', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 100.4,
      };

      mockProductsService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(productId, updateProductDto);

      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate service errors on update', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      mockProductsService.update.mockRejectedValue(new Error('Service error'));

      await expect(controller.update(productId, updateProductDto)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('changeStatus', () => {
    it('should call service.changeStatus with ID and active status', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const changeStatusDto: ChangeStatusDto = { active: false };

      const inactiveProduct = { ...mockProduct, active: false };
      mockProductsService.changeStatus.mockResolvedValue(inactiveProduct);

      const result = await controller.changeStatus(productId, changeStatusDto);

      expect(mockProductsService.changeStatus).toHaveBeenCalledWith(
        productId,
        false,
      );
      expect(result).toBeDefined();
      expect(result.active).toBe(false);
    });

    it('should call service.changeStatus to activate product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const changeStatusDto: ChangeStatusDto = { active: true };

      mockProductsService.changeStatus.mockResolvedValue(mockProduct);

      const result = await controller.changeStatus(productId, changeStatusDto);

      expect(mockProductsService.changeStatus).toHaveBeenCalledWith(
        productId,
        true,
      );
      expect(result.active).toBe(true);
    });

    it('should propagate service errors on changeStatus', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const changeStatusDto: ChangeStatusDto = { active: true };

      mockProductsService.changeStatus.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.changeStatus(productId, changeStatusDto),
      ).rejects.toThrow('Service error');
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct ID', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(mockProductsService.remove).toHaveBeenCalledWith(productId);
    });

    it('should propagate service errors on remove', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockProductsService.remove.mockRejectedValue(new Error('Service error'));

      await expect(controller.remove(productId)).rejects.toThrow('Service error');
    });
  });
});
