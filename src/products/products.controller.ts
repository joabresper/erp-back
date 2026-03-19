import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChangeStatusDto } from './dto/change-status.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('PRODUCTS:CREATE')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @RequirePermissions('PRODUCTS:VIEW')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products retrieved successfully.' })
  findAll(@Query('includeHistory') includeHistory?: string) {
    const includeHistoryFlag = includeHistory === 'true';
    return this.productsService.findAll(includeHistoryFlag);
  }

  @Get(':id')
  @RequirePermissions('PRODUCTS:VIEW')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'The product has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeHistory') includeHistory?: string
  ) {
    const includeHistoryFlag = includeHistory === 'true';
    return this.productsService.findOne(id, includeHistoryFlag);
  }

  @Patch(':id')
  @RequirePermissions('PRODUCTS:UPDATE')
  @ApiOperation({ summary: 'Update product information' })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  // Endpoint to change the active status of a product.
  @Patch(':id/status')
  @RequirePermissions('PRODUCTS:CHANGE_STATUS')
  @ApiOperation({ summary: 'Change the active status of a product' })
  @ApiResponse({ status: 200, description: 'The product status has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() changeStatusDto: ChangeStatusDto) {
    return this.productsService.changeStatus(id, changeStatusDto.active);
  }

  @Delete(':id')
  @RequirePermissions('PRODUCTS:DELETE')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
