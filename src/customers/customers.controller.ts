import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('CUSTOMER:CREATE')
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. A customer with the same tax ID already exists.',
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @RequirePermissions('CUSTOMER:VIEW')
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of customers retrieved successfully.',
  })
  findAll() {
    return this.customersService.findAll();
  }

  @Get('deleted')
  @RequirePermissions('CUSTOMER:VIEW_DELETED')
  @ApiOperation({ summary: 'Get all deleted customers' })
  @ApiResponse({
    status: 200,
    description: 'List of deleted customers retrieved successfully.',
  })
  findDeleted() {
    return this.customersService.findDeleted();
  }

  @Get(':id')
  @RequirePermissions('CUSTOMER:VIEW')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('CUSTOMER:UPDATE')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. A customer with the same tax ID already exists.',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Patch(':id/restore')
  @RequirePermissions('CUSTOMER:RESTORE')
  @ApiOperation({ summary: 'Restore a deleted customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer restored successfully.',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Customer not found.' 
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Customer is not deleted.',
  })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.restore(id);
  }

  @Delete(':id')
  @RequirePermissions('CUSTOMER:DELETE')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Customer is already deleted.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(id);
  }
}
