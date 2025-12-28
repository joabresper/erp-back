import { ApiProperty } from "@nestjs/swagger";

export class User {
	@ApiProperty({
		description: 'ID of the user',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'User email address',
		example: 'test@example.com',
	})
	email: string;

	@ApiProperty({
		description: 'Full name of the user (max 100 characters)',
		example: 'John Doe',
	})
	fullName: string;

	@ApiProperty({
		description: 'User phone number (max 20 characters)',
		example: '1234567890',
		nullable: true
	})
	phone: string | null;

	@ApiProperty({
		description: 'User password',
		example: 'password',
	})
	password: string;

	@ApiProperty({
		description: 'User address (max 200 characters)',
		example: '123 Main St, Anytown, USA',
		nullable: true
	})
	address: string | null;

	@ApiProperty({
		description: 'Role ID of the user',
		example: '1231-hd237-27346',
	})
	roleId: string;

	@ApiProperty({
		description: 'Date when the user was deleted (null if not deleted)',
		example: '2024-06-19T18:25:43.511Z',
		nullable: true,
	})
	deletedAt: Date | null;
}
