import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateCustomerDto {
	@ApiProperty({ description: "Customer's name", example: "John Doe" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ description: "Customer's email address", example: "john.doe@example.com", required: false })
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiProperty({ description: "Customer's phone number", example: "1234567890", required: false })
	@IsNumberString()
	@IsOptional()
	@MinLength(7)
	@MaxLength(15)
	phone?: string;

	@ApiProperty({ description: "Customer's address", example: "123 Main St, Anytown, USA", required: false })
	@IsString()
	@IsOptional()
	address?: string;

	@ApiProperty({ description: "Customer's city", example: "Anytown", required: false })
	@IsString()
	@IsOptional()
	city?: string;

	@ApiProperty({ description: "Customer's postal code", example: "12345", required: false })
	@IsNumberString()
	@IsOptional()
	@MaxLength(6)
	postalCode?: string;

	@ApiProperty({ description: "Customer's tax ID", example: "123-45-6789", required: false })
	@IsString()
	@IsOptional()
	taxId?: string;

	@ApiProperty({ description: "Customer's tax condition", example: "General Taxpayer", required: false })
	@IsString()
	@IsOptional()
	taxCondition?: string;
}
