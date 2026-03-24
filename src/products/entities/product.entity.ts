import { ApiProperty } from "@nestjs/swagger";
import { PriceChange } from "./price-change.entity";
import { Product as PrismaProduct, ProductType, UnitMeasure } from "@prisma/client";

export class Product {
	@ApiProperty({
		description: "ID of the product",
		example: "123e4567-e89b-12d3-a456-426614174000",
	})
	id: string;

	@ApiProperty({
		description: "SKU of the product",
		example: "ABC-123",
	})
	sku: string;

	@ApiProperty({
		description: "Name of the product",
		example: "Bread",
	})
	name: string;

	@ApiProperty({
		description: "Description of the product",
		example: "Fresh bread made with natural ingredients",
	})
	description: string | null;

	@ApiProperty({
		description: "Price of the product",
		example: 19.99,
		type: Number,
	})
	price: number;

	@ApiProperty({
		description: "Type of the product",
		example: "RESALE",
		enum: ProductType,
		enumName: "ProductType",
	})
	type: ProductType;

	@ApiProperty({
		description: "Unit of measure for the product",
		example: "KILOGRAM",
		enum: UnitMeasure,
		enumName: "UnitMeasure",
	})
	unit: UnitMeasure;

	@ApiProperty({
		description: "Indicates if the product is salable",
		example: true,
		default: true,
	})
	isSalable: boolean;

	@ApiProperty({
		description: "Indicates if the product is active",
		example: true,
		default: true,
	})
	active: boolean;

	@ApiProperty({
		description: "Date when the product is created",
		example: "2024-06-19T18:25:43.511Z",
		type: Date,

	})
	createdAt: Date;

	@ApiProperty({
		description: "Date when the product is last updated",
		example: "2024-06-19T18:25:43.511Z",
	})
	updatedAt: Date;

	@ApiProperty({
		description: "List of price changes for the product",
		type: () => [PriceChange],
	})
	priceChanges?: PriceChange[];

	constructor(partial: Partial<PrismaProduct>) {
    Object.assign(this, {
      ...partial,
      // Convertimos el Decimal de Prisma a Number de JS
      price: partial.price ? Number(partial.price) : 0,
    });
  }
}
