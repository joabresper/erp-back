import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { InvoiceType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';

describe('SalesService', () => {
  let service: SalesService;

  const mockPrismaService = {
    invoiceSequence: {
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
    },
    sale: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  const baseCreateSaleDto = (): CreateSaleDto => ({
    paymentMethod: PaymentMethod.CASH,
    paymentStatus: PaymentStatus.PAID,
    invoiceType: InvoiceType.A,
    invoiceDate: new Date('2026-04-18T10:00:00.000Z'),
    customerId: 'customer-99',
    saleItems: [
      {
        productId: 'product-1',
        quantity: 2,
        discountAmount: 10,
      },
      {
        productId: 'product-2',
        quantity: 1,
        discountAmount: 5,
      },
    ],
  });

  const mockRawSale = {
    id: 'sale-1',
    createdAt: new Date('2026-04-18T10:00:00.000Z'),
    totalAmount: 235,
    totalDiscountAmount: 15,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    invoiceNumber: '00001-00000011',
    invoiceDate: new Date('2026-04-18T10:00:00.000Z'),
    invoiceType: InvoiceType.A,
    customerId: 'customer-99',
    createdById: 'user-1',
    items: [
      {
        id: 'item-1',
        productName: 'Product 1',
        productSku: 'SKU-1',
        quantity: 2,
        unitPrice: 100,
        discountAmount: 10,
        subtotalAmount: 200,
        productId: 'product-1',
        saleId: 'sale-1',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sale with computed totals and provided customer', async () => {
      const dto = baseCreateSaleDto();

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne
        .mockResolvedValueOnce({
          id: 'product-1',
          name: 'Product 1',
          sku: 'SKU-1',
          price: 100,
        })
        .mockResolvedValueOnce({
          id: 'product-2',
          name: 'Product 2',
          sku: 'SKU-2',
          price: 50,
        });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue(mockRawSale);

      const result = await service.create('user-1', dto);

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-1');
      expect(mockPrismaService.invoiceSequence.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          prefix: 1,
          type: InvoiceType.A,
        },
      });
      expect(mockPrismaService.invoiceSequence.update).toHaveBeenCalledWith({
        where: { id: 'sequence-1' },
        data: { lastNumber: 11 },
      });
      expect(mockProductsService.findOne).toHaveBeenNthCalledWith(1, 'product-1');
      expect(mockProductsService.findOne).toHaveBeenNthCalledWith(2, 'product-2');
      expect(mockPrismaService.sale.create).toHaveBeenCalledWith({
        data: {
          paymentMethod: PaymentMethod.CASH,
          paymentStatus: PaymentStatus.PAID,
          invoiceType: InvoiceType.A,
          invoiceNumber: '00001-00000011',
          invoiceDate: new Date('2026-04-18T10:00:00.000Z'),
          totalAmount: 235,
          totalDiscountAmount: 15,
          items: {
            create: [
              {
                productId: 'product-1',
                productName: 'Product 1',
                productSku: 'SKU-1',
                quantity: 2,
                unitPrice: 100,
                subtotalAmount: 200,
                discountAmount: 10,
              },
              {
                productId: 'product-2',
                productName: 'Product 2',
                productSku: 'SKU-2',
                quantity: 1,
                unitPrice: 50,
                subtotalAmount: 50,
                discountAmount: 5,
              },
            ],
          },
          createdBy: {
            connect: { id: 'user-1' },
          },
          customer: {
            connect: { id: 'customer-99' },
          },
        },
        include: {
          items: true,
        },
      });
      expect(result).toEqual(expect.any(Sale));
      expect(result.totalAmount).toBe(235);
      expect(result.totalDiscountAmount).toBe(15);
    });

    it('should use default customer when customerId is not provided', async () => {
      const dto = baseCreateSaleDto();
      dto.customerId = undefined;

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne
        .mockResolvedValueOnce({
          id: 'product-1',
          name: 'Product 1',
          sku: 'SKU-1',
          price: 100,
        })
        .mockResolvedValueOnce({
          id: 'product-2',
          name: 'Product 2',
          sku: 'SKU-2',
          price: 50,
        });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue({
        ...mockRawSale,
        customerId: 'customer-default',
      });

      await service.create('user-1', dto);

      expect(mockPrismaService.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customer: {
              connect: { id: 'customer-default' },
            },
          }),
        }),
      );
    });

    it('should use current date when invoiceDate is not provided', async () => {
      const dto = baseCreateSaleDto();
      dto.invoiceDate = undefined;

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne
        .mockResolvedValueOnce({
          id: 'product-1',
          name: 'Product 1',
          sku: 'SKU-1',
          price: 100,
        })
        .mockResolvedValueOnce({
          id: 'product-2',
          name: 'Product 2',
          sku: 'SKU-2',
          price: 50,
        });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue(mockRawSale);

      await service.create('user-1', dto);

      expect(mockPrismaService.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceDate: expect.any(Date),
          }),
        }),
      );
    });

    it('should default item discount to 0 when discountAmount is missing', async () => {
      const dto = baseCreateSaleDto();
      dto.saleItems = [
        {
          productId: 'product-1',
          quantity: 2,
        },
      ];

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({
        id: 'product-1',
        name: 'Product 1',
        sku: 'SKU-1',
        price: 100,
      });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue({
        ...mockRawSale,
        totalAmount: 200,
        totalDiscountAmount: 0,
      });

      await service.create('user-1', dto);

      expect(mockPrismaService.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 200,
            totalDiscountAmount: 0,
            items: {
              create: [
                expect.objectContaining({
                  discountAmount: 0,
                }),
              ],
            },
          }),
        }),
      );
    });

    it('should handle decimal price and quantity totals with floating precision safely', async () => {
      const dto = baseCreateSaleDto();
      dto.saleItems = [
        {
          productId: 'product-1',
          quantity: 3,
          discountAmount: 0.2,
        },
      ];

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({
        id: 'product-1',
        name: 'Product 1',
        sku: 'SKU-1',
        price: 0.1,
      });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue({
        ...mockRawSale,
        totalAmount: 0.10000000000000003,
        totalDiscountAmount: 0.2,
      });

      await service.create('user-1', dto);

      const saleCreateCall = mockPrismaService.sale.create.mock.calls[0][0];
      expect(saleCreateCall.data.totalAmount).toBeCloseTo(0.1, 10);
      expect(saleCreateCall.data.totalDiscountAmount).toBeCloseTo(0.2, 10);
      expect(saleCreateCall.data.items.create[0].subtotalAmount).toBeCloseTo(0.3, 10);
      expect(saleCreateCall.data.items.create[0].discountAmount).toBeCloseTo(0.2, 10);
    });

    it('should support fractional quantities when computing subtotal and total', async () => {
      const dto = baseCreateSaleDto();
      dto.saleItems = [
        {
          productId: 'product-1',
          quantity: 1.25,
          discountAmount: 0.15,
        },
      ];

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({
        id: 'product-1',
        name: 'Product 1',
        sku: 'SKU-1',
        price: 19.99,
      });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue({
        ...mockRawSale,
        totalAmount: 24.8375,
        totalDiscountAmount: 0.15,
      });

      await service.create('user-1', dto);

      const saleCreateCall = mockPrismaService.sale.create.mock.calls[0][0];
      expect(saleCreateCall.data.items.create[0].quantity).toBeCloseTo(1.25, 10);
      expect(saleCreateCall.data.items.create[0].subtotalAmount).toBeCloseTo(24.9875, 10);
      expect(saleCreateCall.data.totalDiscountAmount).toBeCloseTo(0.15, 10);
      expect(saleCreateCall.data.totalAmount).toBeCloseTo(24.8375, 10);
    });

    it('should generate the first padded invoice number when sequence starts at zero', async () => {
      const dto = baseCreateSaleDto();

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 0,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne
        .mockResolvedValueOnce({
          id: 'product-1',
          name: 'Product 1',
          sku: 'SKU-1',
          price: 100,
        })
        .mockResolvedValueOnce({
          id: 'product-2',
          name: 'Product 2',
          sku: 'SKU-2',
          price: 50,
        });
      mockPrismaService.customer.findFirst.mockResolvedValue({ id: 'customer-default' });
      mockPrismaService.sale.create.mockResolvedValue({
        ...mockRawSale,
        invoiceNumber: '00001-00000001',
      });

      await service.create('user-1', dto);

      expect(mockPrismaService.invoiceSequence.update).toHaveBeenCalledWith({
        where: { id: 'sequence-1' },
        data: { lastNumber: 1 },
      });
      expect(mockPrismaService.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceNumber: '00001-00000001',
          }),
        }),
      );
    });

    it('should propagate invoice sequence lookup errors', async () => {
      const dto = baseCreateSaleDto();

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockRejectedValue(
        new Error('invoice sequence missing'),
      );

      await expect(service.create('user-1', dto)).rejects.toThrow('invoice sequence missing');
      expect(mockPrismaService.invoiceSequence.update).not.toHaveBeenCalled();
      expect(mockPrismaService.sale.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when default customer does not exist', async () => {
      const dto = baseCreateSaleDto();
      dto.customerId = undefined;

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne
        .mockResolvedValueOnce({
          id: 'product-1',
          name: 'Product 1',
          sku: 'SKU-1',
          price: 100,
        })
        .mockResolvedValueOnce({
          id: 'product-2',
          name: 'Product 2',
          sku: 'SKU-2',
          price: 50,
        });
      mockPrismaService.customer.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.sale.create).not.toHaveBeenCalled();
    });

    it('should propagate users service errors', async () => {
      const dto = baseCreateSaleDto();
      mockUsersService.findById.mockRejectedValue(new Error('user not found'));

      await expect(service.create('user-1', dto)).rejects.toThrow('user not found');
      expect(mockPrismaService.invoiceSequence.findFirstOrThrow).not.toHaveBeenCalled();
    });

    it('should propagate product lookup errors', async () => {
      const dto = baseCreateSaleDto();

      mockUsersService.findById.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.invoiceSequence.findFirstOrThrow.mockResolvedValue({
        id: 'sequence-1',
        lastNumber: 10,
      });
      mockPrismaService.invoiceSequence.update.mockResolvedValue({});
      mockProductsService.findOne.mockRejectedValue(new Error('product not found'));

      await expect(service.create('user-1', dto)).rejects.toThrow('product not found');
      expect(mockPrismaService.sale.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return sales without product details by default', async () => {
      mockPrismaService.sale.findMany.mockResolvedValue([mockRawSale]);

      const result = await service.findAll();

      expect(mockPrismaService.sale.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              product: false,
            },
          },
        },
      });
      expect(result).toEqual(expect.arrayContaining([expect.any(Sale)]));
    });

    it('should include product details when requested', async () => {
      mockPrismaService.sale.findMany.mockResolvedValue([mockRawSale]);

      await service.findAll(true);

      expect(mockPrismaService.sale.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it('should propagate prisma errors from findAll', async () => {
      mockPrismaService.sale.findMany.mockRejectedValue(new Error('findMany failed'));

      await expect(service.findAll()).rejects.toThrow('findMany failed');
    });
  });

  describe('findOne', () => {
    it('should return one sale without product details by default', async () => {
      mockPrismaService.sale.findFirstOrThrow.mockResolvedValue(mockRawSale);

      const result = await service.findOne('sale-1');

      expect(mockPrismaService.sale.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'sale-1' },
        include: {
          items: {
            include: {
              product: false,
            },
          },
        },
      });
      expect(result).toEqual(expect.any(Sale));
    });

    it('should include product details when requested in findOne', async () => {
      mockPrismaService.sale.findFirstOrThrow.mockResolvedValue(mockRawSale);

      await service.findOne('sale-1', true);

      expect(mockPrismaService.sale.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'sale-1' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it('should propagate prisma errors from findOne', async () => {
      mockPrismaService.sale.findFirstOrThrow.mockRejectedValue(new Error('not found'));

      await expect(service.findOne('sale-1')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('should update a sale and return entity', async () => {
      const updateSaleDto: UpdateSaleDto = {
        paymentStatus: PaymentStatus.PENDING,
      };

      mockPrismaService.sale.update.mockResolvedValue({
        ...mockRawSale,
        paymentStatus: PaymentStatus.PENDING,
      });

      const result = await service.update('sale-1', updateSaleDto);

      expect(mockPrismaService.sale.update).toHaveBeenCalledWith({
        where: { id: 'sale-1' },
        data: updateSaleDto,
      });
      expect(result).toEqual(expect.any(Sale));
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    });

    it('should propagate prisma errors from update', async () => {
      const updateSaleDto: UpdateSaleDto = {
        paymentStatus: PaymentStatus.PENDING,
      };

      mockPrismaService.sale.update.mockRejectedValue(new Error('update failed'));

      await expect(service.update('sale-1', updateSaleDto)).rejects.toThrow('update failed');
    });
  });
});
