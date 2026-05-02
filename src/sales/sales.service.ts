import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Sale } from './entities/sale.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SalesService {
  constructor(
    private prismaService: PrismaService,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async create(id: string, createSaleDto: CreateSaleDto): Promise<Sale> {
    const user = await this.usersService.findById(id);
    const invoiceDate = createSaleDto.invoiceDate || new Date();
    const invoicePrefix = 1;

    const invoiceSequence = await this.prismaService.invoiceSequence.findFirstOrThrow({
      where: {
        prefix: invoicePrefix,
        type: createSaleDto.invoiceType,
      },
    });
    const nextNumber = invoiceSequence.lastNumber + 1;
    const invoiceNumber = `${invoicePrefix.toString().padStart(5, '0')}-${nextNumber.toString().padStart(8, '0')}`;

    await this.prismaService.invoiceSequence.update({
      where: { id: invoiceSequence.id },
      data: { lastNumber: nextNumber },
    });

    const { saleItems, customerId, amountPaid, pickupDate, ...restOfDto } = createSaleDto;
    
    const itemsWithData = await Promise.all(
      saleItems.map(async (item) => {
        const product = await this.productsService.findOne(item.productId);
        const unitPrice = Number(product.price);
        return {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: Number(item.quantity),
          unitPrice: Number(unitPrice),
          subtotalAmount: Number(unitPrice) * Number(item.quantity),
          discountAmount: Number(item.discountAmount) || 0,
        };
      })
    );

    const totalAmount = itemsWithData.reduce((sum, item) => sum + item.subtotalAmount - item.discountAmount, 0);
    const totalDiscountAmount = itemsWithData.reduce((sum, item) => sum + item.discountAmount, 0);
    
    const finalPickupDate = pickupDate || invoiceDate;
    const finalAmountPaid = amountPaid ?? totalAmount;

    const defaultCustomer = await this.prismaService.customer.findFirst({
      where: { taxId: '00000000000' },
    });
    if (!defaultCustomer) {
      throw new BadRequestException('Default customer not found. Please ensure a customer with taxId "00000000000" exists.');
    }
    const customerIdToUse = customerId || defaultCustomer.id;

    const sale = await this.prismaService.sale.create({
      data: {
        ...restOfDto,
        invoiceNumber,
        invoiceDate,
        pickupDate: finalPickupDate,
        amountPaid: finalAmountPaid,
        totalAmount,
        totalDiscountAmount,
        items: {
          create: itemsWithData,
        },
        createdBy: {
          connect: { id: user.id },
        },
        customer: {
          connect: { id: customerIdToUse },
        },
      },
      include: {
        items: true,
      },
    });
    return new Sale(sale);
  }

  async findAll(includeProducts: boolean = false): Promise<Sale[]> {
    const sales = await this.prismaService.sale.findMany({
      include: {
        items: {
          include: {
            product: includeProducts,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        }
      },
    });
    return sales.map((sale) => new Sale(sale));
  }

  async findOne(id: string, includeProducts: boolean = false): Promise<Sale> {
    const sale = await this.prismaService.sale.findFirstOrThrow({
      where: { id },
      include: {
        items: {
          include: {
            product: includeProducts,
            },
          },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return new Sale(sale);
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.prismaService.sale.update({
      where: { id },
      data: updateSaleDto,
    });
    return new Sale(sale);
  }
}
