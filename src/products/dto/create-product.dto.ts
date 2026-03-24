import { ApiProperty } from "@nestjs/swagger";
import { ProductType, UnitMeasure } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
	@ApiProperty({ example: "Bread", description: "The name of the product" })
	@IsString()
	@IsNotEmpty({ message: "Name must not be empty" })
	@MinLength(3, { message: "Name must be at least 3 characters long" })
	name: string;

	@ApiProperty({ example: "ABC-123", description: "The SKU of the product" })
	@IsString()
	@IsNotEmpty({ message: "SKU must not be empty" })
	sku: string;

	@ApiProperty({ example: "Fresh bread made with natural ingredients", description: "The description of the product", required: false })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({ example: 19.99, description: "The price of the product, rounded to two decimal places" })
	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive({ message: "Price must be greater than zero" })
	price: number;

	@ApiProperty({ example: "RESALE", description: "The type of the product", enum: ProductType, required: false })
	@IsEnum(ProductType, { message: "Type must be a valid ProductType enum value" })
	@IsOptional()
	type?: ProductType;

	@ApiProperty({ example: "KG", description: "The unit of measure for the product", enum: UnitMeasure, required: false })
	@IsEnum(UnitMeasure, { message: "Unit must be a valid UnitMeasure enum value" })
	@IsOptional()
	unit?: UnitMeasure;

	@ApiProperty({ example: true, description: "Indicates if the product is salable", required: false, default: true })
	@IsOptional()
	@IsBoolean({ message: "Salable status must be a boolean value" })
	isSalable?: boolean;

	@ApiProperty({ example: true, description: "Indicates if the product is active", required: false, default: true })
	@IsOptional()
	@IsBoolean({ message: "Active status must be a boolean value" })
	active?: boolean;
}
