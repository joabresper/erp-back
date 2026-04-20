import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsEnum, IsOptional, IsUUID, ValidateNested } from "class-validator";
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
