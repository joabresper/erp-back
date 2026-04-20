import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [UsersModule, ProductsModule],
})
export class SalesModule {}
