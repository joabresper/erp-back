import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Prisma, ProductType, UnitMeasure } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sku: 'SKU001',
    name: 'Test Product',
    description: 'Test Description',
    price: new Prisma.Decimal('100.50'),
    type: ProductType.GENERIC,
    unit: UnitMeasure.UNIT,
    isSalable: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    priceChange: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'SKU001',
        name: 'New Product',
        price: 100.50,
        description: 'Test Description',
        type: ProductType.GENERIC,
        unit: UnitMeasure.UNIT,
        isSalable: true,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { sku: createProductDto.sku },
      });
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
      expect(result).toEqual(expect.any(Product));
      expect(result).toMatchObject({
        id: mockProduct.id,
        sku: mockProduct.sku,
        name: mockProduct.name,
      });
    });

    it('should throw BadRequestException if SKU already exists', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'SKU001',
        name: 'New Product',
        price: 100.50,
        description: 'Test Description',
        type: ProductType.GENERIC,
        unit: UnitMeasure.UNIT,
        isSalable: true,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });

    it('should propagate prisma errors while creating a product', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'SKU001',
        name: 'New Product',
        price: 100.50,
        description: 'Test Description',
        type: ProductType.GENERIC,
        unit: UnitMeasure.UNIT,
        isSalable: true,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(createProductDto)).rejects.toThrow('DB error');
    });
  });

  describe('findAll', () => {
    it('should return products filtered by isSalable=false', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.findAll(false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        include: { priceChanges: false },
        where: { isSalable: false },
      });
      expect(result).toEqual(expect.arrayContaining([expect.any(Product)]));
    });

    it('should return products including price history when requested', async () => {
      const productsWithHistory = [
        {
          ...mockProduct,
          priceChanges: [],
        },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(productsWithHistory);

      const result = await service.findAll(undefined, undefined, true);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        include: { priceChanges: true },
        where: {},
      });
      expect(result).toEqual(expect.arrayContaining([expect.any(Product)]));
    });

    it('should return empty array if no products exist', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findAll(false);

      expect(result).toEqual([]);
    });

    it('should propagate prisma errors while retrieving products', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll(false)).rejects.toThrow('DB error');
    });
  });

  describe('findOne', () => {
    it('should return a single product by ID without history', async () => {
      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(
        mockProduct,
      );

      const result = await service.findOne(
        '123e4567-e89b-12d3-a456-426614174000',
        false,
      );

      expect(mockPrismaService.product.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        include: { priceChanges: false },
      });
      expect(result).toEqual(expect.any(Product));
    });

    it('should return a single product by ID with history', async () => {
      const productWithHistory = {
        ...mockProduct,
        priceChanges: [],
      };
      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(
        productWithHistory,
      );

      const result = await service.findOne(
        '123e4567-e89b-12d3-a456-426614174000',
        true,
      );

      expect(mockPrismaService.product.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        include: { priceChanges: true },
      });
      expect(result).toEqual(expect.any(Product));
    });

    it('should throw error if product not found', async () => {
      mockPrismaService.product.findUniqueOrThrow.mockRejectedValue(
        new Error('Product not found'),
      );

      await expect(
        service.findOne('non-existent-id', false),
      ).rejects.toThrow();
    });

    it('should propagate prisma errors while retrieving one product', async () => {
      mockPrismaService.product.findUniqueOrThrow.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.findOne('123e4567-e89b-12d3-a456-426614174000', true)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const userId = '987e6543-e21b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 150,
      };

      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateProductDto,
        price: new Prisma.Decimal('150'),
      });
      mockPrismaService.priceChange.create.mockResolvedValue({});
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        callback(mockPrismaService),
      );

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        userId,
        updateProductDto,
      );

      expect(mockPrismaService.product.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: updateProductDto,
      });
      expect(mockPrismaService.priceChange.create).toHaveBeenCalledWith({
        data: {
          productId: '123e4567-e89b-12d3-a456-426614174000',
          oldPrice: 100.5,
          newPrice: 150,
          userId,
        },
      });
      expect(result).toEqual(expect.any(Product));
    });

    it('should validate SKU is not duplicated when updating', async () => {
      const userId = '987e6543-e21b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        sku: 'SKU002',
      };

      const anotherProduct = { ...mockProduct, id: 'different-id' };
      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
      mockPrismaService.product.findUnique.mockResolvedValue(anotherProduct);

      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateProductDto,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });

    it('should allow updating SKU to the same value', async () => {
      const userId = '987e6543-e21b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        sku: 'SKU001',
      };

      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(mockProduct);
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        callback(mockPrismaService),
      );

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        userId,
        updateProductDto,
      );

      expect(result).toEqual(expect.any(Product));
    });

    it('should update without SKU uniqueness lookup when SKU is not provided', async () => {
      const userId = '987e6543-e21b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(mockProduct);
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        callback(mockPrismaService),
      );

      await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        userId,
        updateProductDto,
      );

      expect(mockPrismaService.product.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: updateProductDto,
      });
      expect(mockPrismaService.priceChange.create).not.toHaveBeenCalled();
    });

    it('should not create price history when price does not change', async () => {
      const userId = '987e6543-e21b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 100.5,
      };

      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateProductDto,
      });
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        callback(mockPrismaService),
      );

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        userId,
        updateProductDto,
      );

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: updateProductDto,
      });
      expect(mockPrismaService.priceChange.create).not.toHaveBeenCalled();
      expect(result).toEqual(expect.any(Product));
    });

    it('should propagate prisma errors while updating', async () => {
      const userId = '987e6543-e21b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      mockPrismaService.product.findUniqueOrThrow.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateProductDto,
        ),
      ).rejects.toThrow('DB error');
    });
  });

  describe('changeStatus', () => {
    it('should change product status to inactive', async () => {
      const inactiveProduct = { ...mockProduct, active: false };
      mockPrismaService.product.update.mockResolvedValue(inactiveProduct);

      const result = await service.changeStatus(
        '123e4567-e89b-12d3-a456-426614174000',
        false,
      );

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: { active: false },
      });
      expect(result).toEqual(expect.any(Product));
    });

    it('should change product status to active', async () => {
      mockPrismaService.product.update.mockResolvedValue(mockProduct);

      const result = await service.changeStatus(
        '123e4567-e89b-12d3-a456-426614174000',
        true,
      );

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: { active: true },
      });
      expect(result).toEqual(expect.any(Product));
    });

    it('should propagate prisma errors while changing status', async () => {
      mockPrismaService.product.update.mockRejectedValue(new Error('DB error'));

      await expect(
        service.changeStatus('123e4567-e89b-12d3-a456-426614174000', true),
      ).rejects.toThrow('DB error');
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should propagate prisma errors while deleting', async () => {
      mockPrismaService.product.delete.mockRejectedValue(new Error('DB error'));

      await expect(
        service.remove('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow('DB error');
    });
  });
});
