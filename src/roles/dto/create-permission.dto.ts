import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePermissionDto {
	@ApiProperty({
		description: 'The name of the permission',
		example: 'users.create',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'The description of the permission',
		example: 'Permission to create users',
	})
	@IsString()
	@IsOptional()
	description?: string;
}

