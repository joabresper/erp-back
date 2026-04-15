import { ApiProperty } from "@nestjs/swagger";

export class PriceChange {
	@ApiProperty({
		description: "ID of the price change record",
		example: "123e4567-e89b-12d3-a456-426614174000",
	})
	id!: string;

	@ApiProperty({
		description: "Old price of the product",
		example: 19.99,
		type: Number,
	})
	oldPrice!: number;

	@ApiProperty({
		description: "New price of the product",
		example: 24.99,
		type: Number,
	})
	newPrice!: number;

	@ApiProperty({
		description: "Date when the price change occurred",
		example: "2024-06-19T18:25:43.511Z",
		type: Date,
	})
	date!: Date;

	@ApiProperty({
		description: "ID of the product associated with this price change",
		example: "123e4567-e89b-12d3-a456-426614174000",
	})
	productId!: string;
}