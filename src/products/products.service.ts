import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private prismaService: PrismaService,
  ) {}
  
  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: { sku: createProductDto.sku }
    });
    if (existingProduct) {
      throw new BadRequestException('Product with this SKU already exists.');
    }

    const newProduct = await this.prismaService.product.create({
      data: createProductDto
    });
    return new Product(newProduct);
  }

  async findAll(includeHistory: boolean): Promise<Product[]> {
    const products = await this.prismaService.product.findMany({
      include: { priceChanges: includeHistory }
    });

    return products.map((product) => new Product(product));
  }

  async findOne(id: string, includeHistory: boolean): Promise<Product> {
    const product = await this.prismaService.product.findUniqueOrThrow({
      where: { id },
      include: { priceChanges: includeHistory }
    });
    return new Product(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    if (updateProductDto.sku) {
      const existingProduct = await this.prismaService.product.findUnique({
        where: { sku: updateProductDto.sku }
      });
      if (existingProduct && existingProduct.id !== id) {
        throw new BadRequestException('Product with this SKU already exists.');
      }
    }
    const product = await this.prismaService.product.update({
      where: { id },
      data: updateProductDto
    });
    return new Product(product);
  }

  // Delete operation exists but is not used in the application. It is implemented for potential future use and to maintain a complete CRUD interface. 
  async remove(id: string): Promise<void> {
    await this.prismaService.product.delete({
      where: { id }
    });
  }

  // Change the active status of a product. This method is used instead of delete to maintain historical data and allow for reactivation of products if needed.
  async changeStatus(id: string, status: boolean): Promise<Product> {
    const product = await this.prismaService.product.update({
      where: { id },
      data: { active: status }
    });
    return new Product(product);
  }
}
