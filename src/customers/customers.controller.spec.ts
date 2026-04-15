import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

describe('CustomersController', () => {
  let controller: CustomersController;

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findDeleted: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
    remove: jest.fn(),
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
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates creation to service', async () => {
      const dto = createCustomerDtoFactory();
      const createdCustomer = customerFactory();
      mockCustomersService.create.mockResolvedValue(createdCustomer);

      const result = await controller.create(dto);

      expect(mockCustomersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdCustomer);
    });

    it('propagates service errors', async () => {
      const dto = createCustomerDtoFactory();
      mockCustomersService.create.mockRejectedValue(
        new ConflictException('Customer with this tax ID already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns all active customers from service', async () => {
      const customers = [customerFactory()];
      mockCustomersService.findAll.mockResolvedValue(customers);

      const result = await controller.findAll();

      expect(mockCustomersService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(customers);
    });

    it('propagates service errors', async () => {
      mockCustomersService.findAll.mockRejectedValue(new Error('db failed'));

      await expect(controller.findAll()).rejects.toThrow('db failed');
    });
  });

  describe('findDeleted', () => {
    it('returns deleted customers from service', async () => {
      const customers = [customerFactory({ active: false })];
      mockCustomersService.findDeleted.mockResolvedValue(customers);

      const result = await controller.findDeleted();

      expect(mockCustomersService.findDeleted).toHaveBeenCalledTimes(1);
      expect(result).toEqual(customers);
    });

    it('propagates service errors', async () => {
      mockCustomersService.findDeleted.mockRejectedValue(new Error('db failed'));

      await expect(controller.findDeleted()).rejects.toThrow('db failed');
    });
  });

  describe('findOne', () => {
    it('returns one customer by id from service', async () => {
      const customer = customerFactory();
      mockCustomersService.findOne.mockResolvedValue(customer);

      const result = await controller.findOne(customer.id);

      expect(mockCustomersService.findOne).toHaveBeenCalledWith(customer.id);
      expect(result).toEqual(customer);
    });

    it('propagates service errors', async () => {
      mockCustomersService.findOne.mockRejectedValue(new Error('not found'));

      await expect(controller.findOne('missing-id')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('delegates update to service', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      const dto: UpdateCustomerDto = { city: 'Cordoba' };
      const updatedCustomer = customerFactory({ id: customerId, city: 'Cordoba' });
      mockCustomersService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update(customerId, dto);

      expect(mockCustomersService.update).toHaveBeenCalledWith(customerId, dto);
      expect(result).toEqual(updatedCustomer);
    });

    it('propagates service errors', async () => {
      const dto: UpdateCustomerDto = { taxId: '20-99999999-9' };
      mockCustomersService.update.mockRejectedValue(
        new ConflictException('Customer with this tax ID already exists'),
      );

      await expect(controller.update('id', dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('restore', () => {
    it('delegates restore to service', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      mockCustomersService.restore.mockResolvedValue(undefined);

      await controller.restore(customerId);

      expect(mockCustomersService.restore).toHaveBeenCalledWith(customerId);
    });

    it('propagates service errors', async () => {
      mockCustomersService.restore.mockRejectedValue(
        new ConflictException('Customer is not deleted'),
      );

      await expect(controller.restore('id')).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('delegates remove to service', async () => {
      const customerId = '11111111-1111-1111-1111-111111111111';
      mockCustomersService.remove.mockResolvedValue(undefined);

      await controller.remove(customerId);

      expect(mockCustomersService.remove).toHaveBeenCalledWith(customerId);
    });

    it('propagates service errors', async () => {
      mockCustomersService.remove.mockRejectedValue(
        new ConflictException('Customer is already deleted'),
      );

      await expect(controller.remove('id')).rejects.toThrow(ConflictException);
    });
  });
});
