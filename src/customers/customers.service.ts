import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    private prismaService: PrismaService
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    if (createCustomerDto.taxId) {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: {
          taxId: createCustomerDto.taxId,
        },
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this tax ID already exists');
      }
    }
    const newCustomer = await this.prismaService.customer.create({
      data: {
        ...createCustomerDto,
        createdAt: new Date(),
      },
    });
    return newCustomer;
  }

  async findAll(): Promise<Customer[]> {
    return await this.prismaService.customer.findMany({
      where: {
        active: true,
      },
    }
    );
  }

  async findDeleted(): Promise<Customer[]> {
    return await this.prismaService.customer.findMany({
      where: {
        active: false,
      },
    });
  }

  async findOne(id: string): Promise<Customer | null> {
    return await this.prismaService.customer.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    if (updateCustomerDto.taxId) {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: { taxId: updateCustomerDto.taxId },
      });
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('Customer with this tax ID already exists');
      }
    }

    return await this.prismaService.customer.update({
      where: {
        id,
      },
      data: {
        ...updateCustomerDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const customer = await this.prismaService.customer.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (!customer.active) {
      throw new ConflictException('Customer is already deleted');
    }

    await this.prismaService.customer.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  }

  async restore(id: string): Promise<void> {
    const customer = await this.prismaService.customer.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (customer.active) {
      throw new ConflictException('Customer is not deleted');
    }
    
    await this.prismaService.customer.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    });
  }
}
