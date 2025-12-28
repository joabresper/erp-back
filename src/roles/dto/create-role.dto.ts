import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
	@ApiProperty({
		description: 'The name of the role',
		example: 'admin',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'The description of the role',
		example: 'Admin role',
	})
	@IsString()
	@IsOptional()
	description?: string;
}
