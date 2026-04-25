import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { type RequestWithUser } from 'src/auth/entities/req.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constant';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.SALE_CREATE)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'The sale has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Req() req: RequestWithUser, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(req.user.id, createSaleDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.SALE_VIEW)
  @ApiOperation({ summary: 'Get all sales' })
  @ApiResponse({ status: 200, description: 'List of sales retrieved successfully.' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.SALE_VIEW)
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'The sale has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Sale not found.' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SALE_UPDATE)
  @ApiOperation({ summary: 'Update a sale' })
  @ApiResponse({ status: 200, description: 'The sale has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Sale not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }
}
