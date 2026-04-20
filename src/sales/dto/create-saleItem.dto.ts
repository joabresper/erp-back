import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from "class-validator";

export class CreateSaleItemDto {
	@ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID of the product being sold" })
	@IsUUID("4", { message: "Product ID must be a valid UUID v4 string" })
	productId!: string;

	@ApiProperty({ example: 10, description: "Quantity of the product being sold" })
	@IsNumber({}, { message: "Quantity must be a number" })
	@Min(0.001, { message: "Quantity must be greater than zero" })
	quantity!: number;

	@ApiProperty({ example: 19.99, description: "Unit discount amount for the sale item" })
	@IsNumber({ maxDecimalPlaces: 2 }, { message: "Discount amount must be a number" })
	@Min(0, { message: "Discount amount cannot be negative" })
	@IsOptional()
	discountAmount?: number;
}