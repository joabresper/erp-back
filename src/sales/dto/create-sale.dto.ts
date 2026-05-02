import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { CreateSaleItemDto } from "./create-saleItem.dto";
import { InvoiceType, PaymentMethod, PaymentStatus } from "@prisma/client";

export class CreateSaleDto {
	@ApiProperty({ example: "CASH", enum: PaymentMethod, description: "Payment method for the sale" })
	@IsEnum(PaymentMethod, { message: "Payment method must be a valid PaymentMethod enum value" })
	paymentMethod!: PaymentMethod;

	@ApiProperty({ example: "PENDING", enum: PaymentStatus, description: "Payment status for the sale" })
	@IsEnum(PaymentStatus, { message: "Payment status must be a valid PaymentStatus enum value" })
	paymentStatus!: PaymentStatus;

	@ApiProperty({ example: "2024-06-01T12:00:00Z", description: "Invoice date for the sale" })
	@IsDate({ message: "Invoice date must be a valid ISO 8601 date string" })
	@Type(() => Date)
	@IsOptional()
	invoiceDate?: Date | null;

	@ApiProperty({ example: "A", enum: InvoiceType, description: "Invoice type for the sale" })
	@IsEnum(InvoiceType, { message: "Invoice type must be a valid InvoiceType enum value" })
	invoiceType!: InvoiceType

	@ApiProperty({ example: 100.00, description: "Amount paid for the sale. If not provided, it will be set to the total amount" })
	@IsNumber({ maxDecimalPlaces: 2 }, { message: "Amount paid must be a number with up to 2 decimal places" })
	@IsOptional()
	amountPaid?: number;

	@ApiProperty({ example: "2024-06-10T15:30:00Z", description: "Pickup date for the sale. If not provided, it will be set to the invoice date" })
	@IsDate({ message: "Pickup date must be a valid ISO 8601 date string" })
	@Type(() => Date)
	@IsOptional()
	pickupDate?: Date;

	@ApiProperty({ example: "John Doe", description: "Contact name for the sale" })
	@IsString({ message: "Contact name must be a string" })
	@MaxLength(100, { message: "Contact name must be at most 100 characters long" })
	@MinLength(3, { message: "Contact name must be at least 3 characters long" })
	@IsOptional()
	contactName?: string;

	@ApiProperty({ type: [CreateSaleItemDto], description: "List of items included in the sale" })
	@IsArray({ message: "Items must be an array" })
	@ValidateNested({ each: true })
	@ArrayMinSize(1, { message: "At least one item must be included in the sale" })
	@Type(() => CreateSaleItemDto)
	saleItems!: CreateSaleItemDto[];

	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "ID of the customer associated with the sale (optional, can be null)",
		required: false,
	 })
	@IsUUID("4", { message: "Sale ID must be a valid UUID v4 string" })
	@IsOptional()
	customerId?: string;
}
