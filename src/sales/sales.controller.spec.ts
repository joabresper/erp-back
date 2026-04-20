import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { InvoiceType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

describe('SalesController', () => {
  let controller: SalesController;

  const mockSalesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockSale = {
    id: 'sale-1',
    createdAt: new Date('2026-04-18T10:00:00.000Z'),
    totalAmount: 230,
    totalDiscountAmount: 20,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    invoiceNumber: '00001-00000011',
    invoiceDate: new Date('2026-04-18T10:00:00.000Z'),
    invoiceType: InvoiceType.A,
    customerId: 'customer-1',
    createdById: 'user-1',
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with user id and dto', async () => {
      const req = { user: { id: 'user-1' } } as any;
      const createSaleDto: CreateSaleDto = {
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.PAID,
        invoiceType: InvoiceType.A,
        invoiceDate: new Date('2026-04-18T10:00:00.000Z'),
        customerId: 'customer-1',
        saleItems: [
          {
            productId: 'product-1',
            quantity: 2,
            discountAmount: 10,
          },
        ],
      };

      mockSalesService.create.mockResolvedValue(mockSale);

      const result = await controller.create(req, createSaleDto);

      expect(mockSalesService.create).toHaveBeenCalledWith('user-1', createSaleDto);
      expect(result).toEqual(mockSale);
    });

    it('should propagate errors from service.create', async () => {
      const req = { user: { id: 'user-1' } } as any;
      const createSaleDto: CreateSaleDto = {
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.PAID,
        invoiceType: InvoiceType.A,
        saleItems: [
          {
            productId: 'product-1',
            quantity: 1,
            discountAmount: 1,
          },
        ],
      };

      mockSalesService.create.mockRejectedValue(new Error('create failed'));

      await expect(controller.create(req, createSaleDto)).rejects.toThrow('create failed');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return sales', async () => {
      mockSalesService.findAll.mockResolvedValue([mockSale]);

      const result = await controller.findAll();

      expect(mockSalesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([mockSale]);
    });

    it('should propagate errors from service.findAll', async () => {
      mockSalesService.findAll.mockRejectedValue(new Error('findAll failed'));

      await expect(controller.findAll()).rejects.toThrow('findAll failed');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      mockSalesService.findOne.mockResolvedValue(mockSale);

      const result = await controller.findOne('sale-1');

      expect(mockSalesService.findOne).toHaveBeenCalledWith('sale-1');
      expect(result).toEqual(mockSale);
    });

    it('should propagate errors from service.findOne', async () => {
      mockSalesService.findOne.mockRejectedValue(new Error('findOne failed'));

      await expect(controller.findOne('sale-1')).rejects.toThrow('findOne failed');
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const updateSaleDto: UpdateSaleDto = {
        paymentStatus: PaymentStatus.CANCELLED,
      };

      mockSalesService.update.mockResolvedValue({
        ...mockSale,
        paymentStatus: PaymentStatus.CANCELLED,
      });

      const result = await controller.update('sale-1', updateSaleDto);

      expect(mockSalesService.update).toHaveBeenCalledWith('sale-1', updateSaleDto);
      expect(result).toEqual({
        ...mockSale,
        paymentStatus: PaymentStatus.CANCELLED,
      });
    });

    it('should propagate errors from service.update', async () => {
      const updateSaleDto: UpdateSaleDto = {
        paymentStatus: PaymentStatus.PENDING,
      };

      mockSalesService.update.mockRejectedValue(new Error('update failed'));

      await expect(controller.update('sale-1', updateSaleDto)).rejects.toThrow('update failed');
    });
  });
});
