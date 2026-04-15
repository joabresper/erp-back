import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  const createCustomerDtoFactory = (
    overrides?: Partial<CreateCustomerDto>,
  ): CreateCustomerDto => ({
    name: 'ACME Corp',
    email: 'acme@example.com',
    phone: '5491122334455',
    address: 'Main St 123',
    city: 'Buenos Aires',
    postalCode: '1000',
    taxId: '20-12345678-9',
    taxCondition: 'Responsable Inscripto',
    ...overrides,
  });

  const customerFactory = (overrides?: Partial<Customer>): Customer => ({
    id: '11111111-1111-1111-1111-111111111111',
    name: 'ACME Corp',
    email: 'acme@example.com',
    phone: '5491122334455',
    address: 'Main St 123',
    city: 'Buenos Aires',
    postalCode: '1000',
    taxId: '20-12345678-9',
    taxCondition: 'Responsable Inscripto',
    active: true,
    createdAt: new Date('2026-04-01T10:00:00.000Z'),
    updatedAt: null,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates customer when taxId is unique', async () => {
      const dto = createCustomerDtoFactory();
      const createdCustomer = customerFactory();

      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.create.mockResolvedValue(createdCustomer);

      const result = await service.create(dto);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { taxId: dto.taxId },
      });
      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          createdAt: expect.any(Date),
        },
      });
      expect(result).toEqual(createdCustomer);
    });

    it('creates customer without checking uniqueness when taxId is not provided', async () => {
      const dto = createCustomerDtoFactory({ taxId: undefined });
      const createdCustomer = customerFactory({ taxId: null });

      mockPrismaService.customer.create.mockResolvedValue(createdCustomer);

      const result = await service.create(dto);

      expect(mockPrismaService.customer.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          createdAt: expect.any(Date),
        },
      });
      expect(result).toEqual(createdCustomer);
    });

    it('throws ConflictException when taxId already exists', async () => {
      const dto = createCustomerDtoFactory();

      mockPrismaService.customer.findUnique.mockResolvedValue(customerFactory());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.customer.create).not.toHaveBeenCalled();
    });

    it('propagates database errors on create', async () => {
      const dto = createCustomerDtoFactory();

      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.create.mockRejectedValue(new Error('db failed'));

      await expect(service.create(dto)).rejects.toThrow('db failed');
    });
  });

  describe('findAll', () => {
    it('returns active customers', async () => {
      const customers = [customerFactory()];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: { active: true },
      });
      expect(result).toEqual(customers);
    });

    it('returns empty list when there are no active customers', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findDeleted', () => {
    it('returns deleted customers', async () => {
      const deletedCustomers = [customerFactory({ active: false })];
      mockPrismaService.customer.findMany.mockResolvedValue(deletedCustomers);

      const result = await service.findDeleted();

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: { active: false },
      });
      expect(result).toEqual(deletedCustomers);
    });
  });

  describe('findOne', () => {
    it('returns one customer by id', async () => {
      const customer = customerFactory();

      mockPrismaService.customer.findUniqueOrThrow.mockResolvedValue(customer);

      const result = await service.findOne(customer.id);

      expect(mockPrismaService.customer.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: customer.id },
      });
      expect(result).toEqual(customer);
    });

    it('propagates not found errors', async () => {
      mockPrismaService.customer.findUniqueOrThrow.mockRejectedValue(
        new Error('not found'),
      );

      await expect(service.findOne('missing-id')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('updates customer after validating unique taxId for another customer', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      const dto: UpdateCustomerDto = {
        name: 'Updated ACME',
        taxId: '20-99999999-9',
      };
      const updatedCustomer = customerFactory({
        id: customerId,
        name: 'Updated ACME',
        taxId: dto.taxId,
        updatedAt: new Date('2026-04-10T12:00:00.000Z'),
      });

      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.update.mockResolvedValue(updatedCustomer);

      const result = await service.update(customerId, dto);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { taxId: dto.taxId },
      });
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          ...dto,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedCustomer);
    });

    it('updates customer when taxId belongs to same customer', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      const dto: UpdateCustomerDto = { taxId: '20-12345678-9' };

      mockPrismaService.customer.findUnique.mockResolvedValue(
        customerFactory({ id: customerId, taxId: dto.taxId }),
      );
      mockPrismaService.customer.update.mockResolvedValue(
        customerFactory({ id: customerId, taxId: dto.taxId }),
      );

      await service.update(customerId, dto);

      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          ...dto,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('throws ConflictException when taxId belongs to another customer', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      const dto: UpdateCustomerDto = { taxId: '20-99999999-9' };

      mockPrismaService.customer.findUnique.mockResolvedValue(
        customerFactory({
          id: '22222222-2222-2222-2222-222222222222',
          taxId: dto.taxId,
        }),
      );

      await expect(service.update(customerId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.customer.update).not.toHaveBeenCalled();
    });

    it('updates customer without uniqueness lookup when taxId is not sent', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      const dto: UpdateCustomerDto = { city: 'Cordoba' };

      mockPrismaService.customer.update.mockResolvedValue(
        customerFactory({ id: customerId, city: 'Cordoba' }),
      );

      await service.update(customerId, dto);

      expect(mockPrismaService.customer.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.customer.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft deletes an active customer', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';

      mockPrismaService.customer.findUniqueOrThrow.mockResolvedValue(
        customerFactory({ id: customerId, active: true }),
      );
      mockPrismaService.customer.update.mockResolvedValue(
        customerFactory({ id: customerId, active: false }),
      );

      await service.remove(customerId);

      expect(mockPrismaService.customer.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: customerId },
      });
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: { active: false },
      });
    });

    it('throws ConflictException when customer is already deleted', async () => {
      mockPrismaService.customer.findUniqueOrThrow.mockResolvedValue(
        customerFactory({ active: false }),
      );

      await expect(service.remove('customer-id')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.customer.update).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('restores a deleted customer', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';

      mockPrismaService.customer.findUniqueOrThrow.mockResolvedValue(
        customerFactory({ id: customerId, active: false }),
      );
      mockPrismaService.customer.update.mockResolvedValue(
        customerFactory({ id: customerId, active: true }),
      );

      await service.restore(customerId);

      expect(mockPrismaService.customer.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: customerId },
      });
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: { active: true },
      });
    });

    it('throws ConflictException when customer is not deleted', async () => {
      mockPrismaService.customer.findUniqueOrThrow.mockResolvedValue(
        customerFactory({ active: true }),
      );

      await expect(service.restore('customer-id')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.customer.update).not.toHaveBeenCalled();
    });
  });
});
