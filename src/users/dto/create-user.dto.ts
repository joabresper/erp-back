import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateUserDto {
	@ApiProperty({
		description: 'The email of the user',
		example: 'test@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: 'The full name of the user (max 100 characters)',
		example: 'John Doe',
	})
	@IsString()
	@MaxLength(100)
	@IsNotEmpty()
	fullName: string;

	@ApiProperty({
		description: 'The password of the user',
		example: 'password',
	})
	@IsString()
	@IsNotEmpty()
	password: string;

	@ApiProperty({
		description: 'The phone of the user (max 20 characters)',
		example: '1234567890',
	})
	@IsString()
	@MaxLength(20)
	@IsOptional()
	phone?: string;

	@ApiProperty({
		description: 'The address of the user (max 200 characters)',
		example: '123 Main St, Anytown, USA',
	})
	@IsString()
	@MaxLength(200)
	@IsOptional()
	address?: string;

	@ApiProperty({
		description: 'The roleId of the user',
	})	
	@IsString()
	@IsUUID()
	@IsOptional()
	roleId?: string;
}
